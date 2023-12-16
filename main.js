import { noteTools } from './noteTools.js'

let nameInput = document.getElementById('name'),
  dateInput = document.getElementById('date'),
  timeInput = document.getElementById('time'),
  locationInput = document.getElementById('location'),
  notesInput = document.getElementById('notes'),
  searchInput = document.getElementById('searchInput'),
  notesArea = document.querySelector('.notesArea'),
  submitBtn = document.getElementById('submit'),
  cancelBtn = document.getElementById('cancel')

let markerSet = false,
  keyOnSubmit,
  newKey

document.getElementById('clear').addEventListener('click', clear)

function clear() {
  nameInput.value = ''
  dateInput.value = ''
  timeInput.value = ''
  locationInput.value = ''
  notesInput.value = ''

  if (marker) {
    map.removeLayer(marker)
    map.removeLayer(circle)
    markerSet = false
  }
}

function getSpecificKey(key) {
  return JSON.parse(localStorage.getItem(key))
}

function getKeys() {
  return JSON.parse(localStorage.getItem('array_keys')) || []
}

function getObjects() {
  return getKeys().map(key => JSON.parse(localStorage.getItem(key)))
}

// DISPLAY OLD DATAS
displayObjects()

async function displayObjects() {
  const dataObjects = await getObjects()

  dataObjects.forEach(data => {
    const notes = createNote(data, 'old')
    notesArea.appendChild(notes)
  })
}

function createNote(data, status) {
  const notesContainer = document.createElement('div')
  notesContainer.classList.add('notesContainer')

  switch (status) {
    case 'new':
      notesContainer.setAttribute('data-key', newKey)
      break
    case 'old':
      const setKey = getKeys().find(key => {
        const storedData = JSON.parse(localStorage.getItem(key))
        return JSON.stringify(storedData) === JSON.stringify(data)
      })
      if (setKey) {
        notesContainer.setAttribute('data-key', setKey)
      }
      break
  }
  notesContainer.appendChild(createText(data))
  notesContainer.appendChild(noteTools())

  return notesContainer
}

function createText(data) {
  const notes = document.createElement('div')
  notes.classList.add('notes')

  for (const property in data) {
    const p = document.createElement('p')
    p.innerHTML = `${property}: ${data[property]}`
    notes.appendChild(p)
  }
  return notes
}

// CREATE NEW DATAS
function generateKey() {
  newKey = `${Date.now()}_${Math.floor(Math.random() * 1000)}`
}

function setLocalStorage() {
  generateKey()
  localStorage.setItem(newKey, createObj())

  let updatedKeys = getKeys().concat(newKey)
  localStorage.setItem('array_keys', JSON.stringify(updatedKeys))

  const notes = createNote(JSON.parse(createObj()), 'new')
  notesArea.appendChild(notes)
}

function createObj() {
  return JSON.stringify({
    name: nameInput.value || '',
    date: dateInput.value || '',
    time: timeInput.value || '',
    location: locationInput.value,
    notes: notesInput.value || '',
  })
}

// SEARCH QUERY
function filterNotes(searchQuery) {
  const notesContainers = document.querySelectorAll('.notesContainer')

  notesContainers.forEach(note => {
    const noteText = note.innerText.toLowerCase()
    const isVisible = noteText.includes(searchQuery.toLowerCase())

    note.style.display = isVisible ? 'flex' : 'none'
  })
}

searchInput.addEventListener('input', e => {
  const searchQuery = e.target.value.trim()
  filterNotes(searchQuery)
})

// EDIT, DELETE, SHARE
try {
  document.addEventListener('click', e => {
    let classList = e.target.classList
    let note = e.target.closest('.notesContainer')
    let dataKey = note.getAttribute('data-key')

    if (classList.contains('edit')) {
      editFn(dataKey)
    } else if (classList.contains('delete')) {
      deleteFn(note, dataKey)
    } else if (classList.contains('share')) {
      shareFn()
    }
  })
} catch (err) {}

async function editFn(dataKey) {
  editModeStyles()

  keyOnSubmit = dataKey
  const dataObject = await getSpecificKey(dataKey)

  nameInput.value = dataObject.name
  dateInput.value = dataObject.date
  timeInput.value = dataObject.time
  locationInput.value = dataObject.location
  notesInput.value = dataObject.notes

  const [lat, lng] = dataObject.location.split(', ')

  addMarkerAndCircle(
    lat.replace(/Lat: |Lng: /g, ''),
    lng.replace(/Lat: |Lng: /g, '')
  )
}

function deleteFn(note, dataKey) {
  let updatedKeys = getKeys().filter(key => key !== dataKey)
  localStorage.setItem('array_keys', JSON.stringify(updatedKeys))

  localStorage.removeItem(dataKey)
  note.remove()
}

function shareFn() {
  const dataToShare = getKeys()
  const encodedData = encodeURIComponent(dataToShare)
  const shareableLink = `${window.location.href}?data=${encodedData}`

  alert(`Share this link: ${shareableLink}`)
}

cancelBtn.addEventListener('click', () => {
  initialStyles()
})

submitBtn.addEventListener('click', e => {
  e.preventDefault()
  if (markerSet) {
    if (submitBtn.value === 'Save') {
      initialStyles()
      localStorage.setItem(keyOnSubmit, createObj())
    } else if (submitBtn.value !== 'Save') {
      setLocalStorage()
    }
  } else {
    alert('Please select a location on the map first.')
  }
})

// CSS STYLES
function initialStyles() {
  submitBtn.value = 'Submit'
  submitBtn.style = 'background-color: hsl(158, 100%, 34%);'
  cancelBtn.style.display = 'none'
}

function editModeStyles() {
  cancelBtn.style.display = 'block'

  nameInput.scrollIntoView({ behavior: 'smooth' })
  submitBtn.value = 'Save'
  submitBtn.style = 'background-color: blue'
}

// LEAFLET
let map = L.map('map').setView([14.29693, 120.955501], 11)

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map)

let marker, circle

function addMarkerAndCircle(lat, lng, radius = 10) {
  if (marker) {
    map.removeLayer(marker)
    map.removeLayer(circle)
  }

  marker = L.marker([lat, lng]).addTo(map)
  circle = L.circle([lat, lng], { radius }).addTo(map)

  map.setView([lat, lng])
  markerSet = true
}

map.on('click', function (e) {
  const { lat, lng } = e.latlng
  addMarkerAndCircle(lat, lng)

  locationInput.value = `Lat: ${lat}, Lng: ${lng}`
})
