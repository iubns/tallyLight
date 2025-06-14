import { init_gpio, 
  GPIO_MODE_INPUT_PULLDOWN, 
  get_gpio,
  set_gpio,
  GPIO_MODE_OUTPUT } from "@iiot2k/gpiox"
  import { Atem }from "atem-connection"

init_gpio(2, GPIO_MODE_INPUT_PULLDOWN, true)
init_gpio(3, GPIO_MODE_INPUT_PULLDOWN, true)
init_gpio(4, GPIO_MODE_INPUT_PULLDOWN, true)
init_gpio(14, GPIO_MODE_INPUT_PULLDOWN, true)

init_gpio(15, GPIO_MODE_OUTPUT, true)
init_gpio(18, GPIO_MODE_OUTPUT, true)
init_gpio(23, GPIO_MODE_OUTPUT, true)
init_gpio(24, GPIO_MODE_OUTPUT, true)
init_gpio(25, GPIO_MODE_OUTPUT, true)
init_gpio(8, GPIO_MODE_OUTPUT, true)


const myAtem = new Atem();

myAtem.on('info', console.log);
myAtem.on('error', console.error);

myAtem.connect('10.7.8.98'); // 스위처의 IP 주소 입력


interface Screen {
  id: number
  name: string
  gpio: number
  PGM: boolean
  RVW: boolean
  PGM_GPIO: number 
  RVW_GPIO: number 
}

const SWITCH_BUTTON_GPIO = 14 // GPIO for the switch button

const screens: Array<Screen> = [
  {
    id: 1,
    name: "Screen 1",
    gpio: 3,
    PGM: true,
    RVW: false,
    PGM_GPIO: 15,
    RVW_GPIO: 18,
  },
  {
    id: 2,
    name: "Screen 2",
    gpio: 4,
    PGM: false,
    RVW: true,
    PGM_GPIO: 23,
    RVW_GPIO: 24,
  },
  {
    id: 3,
    name: "Screen 3",
    gpio: 2,
    PGM: false,
    RVW: false,
    PGM_GPIO: 25,
    RVW_GPIO: 8,
  },
]

myAtem.on('stateChanged', (state, pathToChange) => {
  const programInput = state.video.mixEffects[0]?.programInput
  const previewinput = state.video.mixEffects[0]?.previewInput

  if( programInput === undefined || previewinput === undefined) {
    return
  }

  screens.forEach((screen) => {
    if (screen.id === programInput) {
      screen.PGM = true;
      screen.RVW = false;
    } else if (screen.id === previewinput) {
      screen.RVW = true;
      screen.PGM = false;
    } else {
      screen.PGM = false;
      screen.RVW = false;
    }
  })
  setLED()
})

const screenButtons: Array<boolean> = new Array(screens.length).fill(false)
let switchButton: boolean = false

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
      switchButton = get_gpio(SWITCH_BUTTON_GPIO) 
      if (switchButton) {
      toggleScreen()
    }
      return
    }
  }, 100)
}

export function toggleScreen() {
  screens.forEach((screen) => {
    if (screen.PGM) {
      myAtem.changePreviewInput(screen.id)
      screen.PGM = false
      screen.RVW = true
    } else if (screen.RVW) {
      myAtem.changeProgramInput(screen.id)
      screen.RVW = false
      screen.PGM = true
    }
  })
  setLED()
}

export function setRVM(screenId: number) {
  screens.forEach((screen) => {
    if (screen.id === screenId) {
      myAtem.changePreviewInput(screen.id)
      screen.RVW = true
      return
    }
    screen.RVW = false
  })
  setLED()
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

function setLED() {
  screens.forEach((screen) => {
    if( screen.PGM ) {
      set_gpio(screen.PGM_GPIO, true)
      set_gpio(screen.RVW_GPIO, false)
    }else if( screen.RVW ) {
      set_gpio(screen.PGM_GPIO, false)
      set_gpio(screen.RVW_GPIO, true)
    } else {
      set_gpio(screen.PGM_GPIO, false)
      set_gpio(screen.RVW_GPIO, false)
    }
  })
}

startInterval()
