import { init_gpio, GPIO_MODE_INPUT_PULLDOWN, get_gpio } from "@iiot2k/gpiox"

init_gpio(2, GPIO_MODE_INPUT_PULLDOWN, true)
init_gpio(3, GPIO_MODE_INPUT_PULLDOWN, true)
init_gpio(4, GPIO_MODE_INPUT_PULLDOWN, true)
init_gpio(14, GPIO_MODE_INPUT_PULLDOWN, true)

interface Screen {
  id: string
  name: string
  gpio: number
  PGM: boolean
  RVW: boolean
}

const SWITCH_BUTTON_GPIO = 14 // GPIO for the switch button

const screens: Array<Screen> = [
  {
    id: "screen1",
    name: "Screen 1",
    gpio: 3,
    PGM: true,
    RVW: false,
  },
  {
    id: "screen2",
    name: "Screen 2",
    gpio: 4,
    PGM: false,
    RVW: true,
  },
  {
    id: "screen3",
    name: "Screen 3",
    gpio: 2,
    PGM: false,
    RVW: false,
  },
]

const screenButtons: Array<boolean> = new Array(screens.length).fill(false)
const switchButton: boolean = false

function startInterval() {
  setInterval(() => {
    screens.forEach((screen, index) => {
      const gpioValue = !get_gpio(screen.gpio) // default is pulled down, so we invert the value
      if (gpioValue == screenButtons[index]) {
        return // No change in GPIO state
      }
      screenButtons[index] = gpioValue // Update button state

      setRVM(screen.id)
    })

    if (get_gpio(SWITCH_BUTTON_GPIO) != switchButton) {
      toggleScreen()
      return
    }
  }, 100)
}

export function toggleScreen() {
  screens.forEach((screen) => {
    if (screen.PGM) {
      screen.PGM = false
      screen.RVW = true
    } else if (screen.RVW) {
      screen.RVW = false
      screen.PGM = true
    }
  })
}

export function setRVM(screenId: string) {
  screens.forEach((screen) => {
    if (screen.id === screenId) {
      screen.RVW = true
      return
    }
    screen.RVW = false
  })
}

export function screenState() {
  return screens.map((screen) => {
    return {
      id: screen.id,
      name: screen.name,
      PGM: screen.PGM,
      RVW: screen.RVW,
    }
  })
}

startInterval()
