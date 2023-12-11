export function components() {
  let div = document.createElement('div')
  div.classList.add('components')

  for (let i = 0; i < 3; i++) {
    let button = document.createElement('button')
    switch (i) {
      case 0:
        button.classList.add('edit')
        break
      case 1:
        button.classList.add('delete')
        break
      case 2:
        button.classList.add('share')
        break
    }
    div.appendChild(button)
  }
  return div
}
