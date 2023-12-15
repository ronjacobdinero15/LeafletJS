import { components } from './components.js'

let nameInput = document.getElementById('name'),
  dateInput = document.getElementById('date'),
  timeInput = document.getElementById('time'),
  locationInput = document.getElementById('location'),
  cancel = document.getElementById('cancel'),
  searchInput = document.getElementById('searchInput'),
  notesInput = document.getElementById('notes'),
  notes_area = document.querySelector('.notes_area'),
  submit = document.getElementById('submit'),
  new_array_key

let markerSet = false
let keyOnSubmit

function filterNotes(searchQuery) {
  const notesContainers = document.querySelectorAll('.notes_container')

  notesContainers.forEach(note => {
    const notesText = note.innerText.toLowerCase()
    const isVisible = notesText.includes(searchQuery.toLowerCase())

    note.style.display = isVisible ? 'flex' : 'none'
  })
}

// Add an event listener for the search input
searchInput.addEventListener('input', e => {
  const searchQuery = e.target.value.trim()
  filterNotes(searchQuery)
})

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

function getLocalStorage() {
  return getCurrentArrayKeys().map(key => JSON.parse(localStorage.getItem(key)))
}

function createFromLocalStorage() {
  const dataObjects = getLocalStorage()

  dataObjects.forEach(data => {
    const notes = createNote(data, 'old')
    notes_area.appendChild(notes)
  })
}

createFromLocalStorage()

function createObj() {
  return JSON.stringify({
    name: nameInput.value || '',
    date: dateInput.value || '',
    time: timeInput.value || '',
    location: locationInput.value,
    notes: notesInput.value || '',
  })
}

function createNote(data, status) {
  const notes_container = document.createElement('div')
  notes_container.classList.add('notes_container')

  if (status === 'new') {
    notes_container.setAttribute('data-key', new_array_key)
  } else if (status === 'old') {
    const setKey = getCurrentArrayKeys().find(key => {
      const storedData = JSON.parse(localStorage.getItem(key))
      return JSON.stringify(storedData) === JSON.stringify(data)
    })
    if (setKey) {
      notes_container.setAttribute('data-key', setKey)
    }
  }

  const notes = document.createElement('div')
  notes.classList.add('notes')

  for (const property in data) {
    const p = document.createElement('p')
    p.innerHTML = `${property}: ${data[property]}`
    notes.appendChild(p)
  }

  notes_container.appendChild(notes)
  notes_container.appendChild(components())

  return notes_container
}

function generateKey() {
  const unique_key = `${Date.now()}_${Math.floor(Math.random() * 1000)}`
  new_array_key = unique_key
  return unique_key
}

function setLocalStorage() {
  let unique_key = generateKey()
  localStorage.setItem(unique_key, createObj())

  let local = JSON.parse(localStorage.getItem('array_keys')) || []
  let newLocal = local.concat(unique_key)
  localStorage.setItem('array_keys', JSON.stringify(newLocal))

  const notes = createNote(JSON.parse(createObj()), 'new')
  notes_area.appendChild(notes)
}

function submitStyle() {
  submit.value = 'Submit'
  submit.style = 'background-color: hsl(158, 100%, 34%);'
}

submit.addEventListener('click', e => {
  e.preventDefault()

  if (document.forms[0].checkValidity()) {
    if (submit.value === 'Save') {
      submitStyle()
      cancel.style.display = 'none'

      localStorage.setItem(keyOnSubmit, createObj())
      location.reload()
    } else if (markerSet && submit.value !== 'Save') {
      setLocalStorage()
    } else {
      alert('Please select a location on the map first.')
    }
  } else {
    alert('Please fill in all required fields.')
  }
})

function getSpecificKey(key) {
  return JSON.parse(localStorage.getItem(key))
}

cancel.addEventListener('click', e => {
  cancel.style.display = 'none'

  submitStyle()
})

function editFn(dataKey) {
  cancel.style.display = 'block'

  document.body.scrollIntoView({ behavior: 'smooth' })
  submit.value = 'Save'
  submit.style = 'background-color: blue'

  keyOnSubmit = dataKey
  const dataObject = getSpecificKey(dataKey)

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

document.addEventListener('click', e => {
  let classList = e.target.classList
  let note = e.target.closest('.notes_container')
  let dataKey = note.getAttribute('data-key')

  if (classList.contains('edit')) {
    editFn(dataKey)
  } else if (classList.contains('delete')) {
    deleteFn(note, dataKey)
  } else if (classList.contains('share')) {
    shareFn()
  }
})

function shareFn() {
  const dataToShare = getCurrentArrayKeys()
  const encodedData = encodeURIComponent(dataToShare)
  const shareableLink = `${window.location.href}?data=${encodedData}`

  alert(`Share this link: ${shareableLink}`)
}

function getCurrentArrayKeys() {
  return JSON.parse(localStorage.getItem('array_keys')) || []
}

function deleteFn(note, dataKey) {
  let updatedKeys = getCurrentArrayKeys().filter(key => key !== dataKey)
  localStorage.setItem('array_keys', JSON.stringify(updatedKeys))

  localStorage.removeItem(dataKey)
  note.remove()
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
}

map.on('click', function (e) {
  const { lat, lng } = e.latlng
  addMarkerAndCircle(lat, lng)
  markerSet = true

  locationInput.value = `Lat: ${lat}, Lng: ${lng}`
})
