import { components } from './components.js'

const nameInput = document.getElementById('name'),
  dateInput = document.getElementById('date'),
  timeInput = document.getElementById('time'),
  locationInput = document.getElementById('location'),
  notesInput = document.getElementById('notes'),
  notes_area = document.querySelector('.notes_area'),
  submit = document.getElementById('submit'),
  array_keys = JSON.parse(localStorage.getItem('array_keys')) || []

let markerSet = false

document.getElementById('clear').addEventListener('click', () => {
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
})

function getLocalStorage() {
  return array_keys.map(key => JSON.parse(localStorage.getItem(key)))
}

function createFromLocalStorage() {
  const dataObjects = getLocalStorage()

  dataObjects.forEach(data => {
    const notes = createNote(data, false)
    notes_area.appendChild(notes)
  })
}

createFromLocalStorage()

function createObj() {
  return {
    key: generateKey(),
    name: nameInput.value || '',
    date: dateInput.value || '',
    time: timeInput.value || '',
    location: locationInput.value,
    notes: notesInput.value || '',
  }
}

function createNote(data, newNote) {
  const notes_container = document.createElement('div')
  notes_container.classList.add('notes_container')

  if (newNote) {
    notes_container.setAttribute('data-key', array_keys[array_keys.length - 1])
  } else {
    const setKey = array_keys.find(key => {
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
  array_keys.push(unique_key)
  return unique_key
}

function setLocalStorage() {
  const data = createObj()
  const data_serialized = JSON.stringify(data)

  localStorage.setItem(data.key, data_serialized)
  localStorage.setItem('array_keys', JSON.stringify(array_keys))

  const notes = createNote(data, true)
  notes_area.appendChild(notes)
}

submit.addEventListener('click', e => {
  e.preventDefault()

  if (document.forms[0].checkValidity()) {
    if (markerSet) {
      setLocalStorage()
    } else {
      alert('Please select a location on the map first.')
    }
  } else {
    alert('Please fill in all required fields.')
  }
})

document.addEventListener('click', e => {
  if (e.target.classList.contains('edit')) {
  }

  if (e.target.classList.contains('delete')) {
    const notes_container = e.target.closest('.notes_container')
    const dataKey = notes_container.getAttribute('data-key')

    localStorage.removeItem(dataKey)
    notes_container.remove()

    const updatedArray = currentArrayKeys().filter(key => key !== dataKey)
    localStorage.setItem('array_keys', JSON.stringify(updatedArray))
  }

  if (e.target.classList.contains('share')) {
  }
})

function currentArrayKeys() {
  return JSON.parse(localStorage.getItem('array_keys'))
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
