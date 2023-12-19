import * as readline from 'readline';


// just something to explicitly define the form of an object to avoid errors
interface DimensionalArrayInterface {
    value: number;
    data: string[];
}

class Screen {
    //#region Properties
    private static _isShowingDebug: boolean = false
    private static _isShowingCommands: boolean = false

    // error handling
    public static errorReason: string | undefined
    public static isInputError: boolean = false

    // screen properties
    private static _maxResolution: number = 64
    public static width: number = 0
    public static height: number = 0
    public static pixelOff: string = "\x1b[48;5;8m  \x1b[0m"
    public static pixelOn: string = "\x1b[48;5;15m  \x1b[0m"

    private static _rendererSelection: number | undefined = undefined
    private static _isComingFromSettings: boolean = false

    // rendering
    public static isInitialRender: boolean = false
    public static isInitialCharacter: boolean = false
    public static a2dArray: DimensionalArrayInterface[] = []

    public static referenceX: number = 0
    public static referenceY: number = 0

    private static _isClockEnabled: boolean = false
    private static _targetFPS: number = 100
    // private static _targetFPS: number = 1000
    private static _renderDuration: string = ""

    public static ResetRendererConfig() {
        if (this._rendererSelection !== 2 && 3) {
            this._rendererSelection = undefined
        }

        this.referenceX = 0
        this.referenceY = 0

        this.isInitialRender = false
        this.isInitialCharacter = false

        this._isComingFromSettings = false

        this.a2dArray = []
    }
    //#endregion

    public static Main() {
        Console.ClearScreen()
        const a = Console.ReadLine("Welcome to this random project made with boredom. Press enter to continue.")
        Console.ClearScreen()
        this.Setup()

        // Start
        Screen.Render()
        Screen.ConsolePixelEngine()
    }

    public static Setup() {
        // this method was reused.
        // initial reset
        if (this._isComingFromSettings) {
            Screen.ResetRendererConfig()
        }

        // begin setup
        while (true) {
            try {
                if (Screen.isInputError) {
                    Console.WriteLine(`Error: ${Screen.errorReason}`)
                    Screen.isInputError = false
                }

                Console.WriteLine("Define Grid Width:")
                Screen.width = Console.ReadInt()

                Console.ClearScreen()
                Console.WriteLine("Define Grid Height:")
                Screen.height = Console.ReadInt()
                evaluateInputs()

                this.BuildScreenData()

                return
            } catch (e) {
                Screen.isInputError = true
                Console.ClearScreen()
            }
        }

        // assistive functions
        function evaluateInputs() {
            if ((Screen.width || Screen.height) === 0) throwReport()
            else if (Screen.width > Screen._maxResolution || Screen.height > Screen._maxResolution) throwReport()
        }

        function throwReport() {
            Screen.errorReason = `Width and Height values must be greater than 0 or equal to ${Screen._maxResolution}.`
            throw new Error(`Width and Height values must be greater than 0 or equal to ${Screen._maxResolution}.`)
        }
    }

    public static BuildScreenData() {
        // creates screen if not yet created
        if (!this.isInitialRender) {
            for (let i = 0; i < this.height; i++) {
                let obj: { value: number; data: string[]; } = { value: i, data: [] };

                for (let j = 0; j < this.width; j++) {
                    obj.data.push(this.pixelOff);
                }
                this.a2dArray.push(obj);
            }

            this.isInitialRender = true;

            // Render Character after initialization
            this.renderCharacter(this.width, this.height)
        }
    }

    public static BuildScreenDataIndependentlty() {
        // Rebuilds screen for every new update
        Screen.a2dArray = []

        for (let i = 0; i < Screen.height; i++) {
            let obj: { value: number; data: string[]; } = { value: i, data: [] }

            for (let j = 0; j < Screen.width; j++) {
                obj.data.push(Screen.pixelOff)
            }
            Screen.a2dArray.push(obj)
        }
    }

    // initiates character if not yet initiated on a random point
    private static renderCharacter(x: number, y: number) {
        let xAnchor = this.PointGenerator(x)
        let yAnchor = this.PointGenerator(y)

        this.referenceX = xAnchor
        this.referenceY = yAnchor

        const obj: DimensionalArrayInterface[] = Screen.a2dArray;
        obj[yAnchor].data[xAnchor] = Screen.pixelOn;

        Screen.isInitialCharacter = true;
    }

    public static Render(input?: string, renderSelection?: number) {
        // measure FPS Speed
        const startTime = performance.now()

        if (renderSelection === 0) this.Settings()

        // select method to display rendering
        switch (renderSelection) {
            case 1:
                Console.ClearScreen()
                Console.WriteLine(`Press ESC to stop. Total Bounces: ${DVDMoment.TotalBounces}  Corner Bounces: ${DVDMoment.TotalCornerBounces}`)
                DVDMoment.Bounce()
                break
            case 2:
                Console.ClearScreen()
                Console.WriteLine("Press any key to update the screen. Press Q to show commands. Press Ctrl + C to Exit.")
                RenderLine.Draw()
                break
            case 3:
                Console.ClearScreen()
                Console.WriteLine("Use the arrow keys to move. Press Q to show commands. Press Ctrl + C to Exit.")
                RenderLine.ExceptItsCharacterMode(input)
                break
            case 4:
                Console.ClearScreen()
                Console.WriteLine("Press ESC to reset. Press Q to show commands. Press Ctrl + C to Exit.")
                Explosion.JustDoIt()
                break

            default:
                Console.ClearScreen()
                Console.WriteLine("Use the arrow keys to move. Press Q to show commands. Press Ctrl + C to Exit.")

                TranslateCharacter.ToDirection(input)
                break
        }

        // decodes 2D array into an identifiable-looking interface data process
        let renderAccumulator = "";

        for (const col of Screen.a2dArray) { // opens the "columns" of the 2d array

            for (const row of col.data) { // exports the "rows" to the renderAccumulator by using the "column" index as reference
                const outVal = row;
                renderAccumulator = renderAccumulator + outVal;
            }
            Console.WriteLine(renderAccumulator);

            renderAccumulator = ""; // reset to avoid stacking
        }


        const endTime = performance.now()
        this._renderDuration = ((endTime - startTime)).toFixed(2)

        FPSCounter.updateFPS()

        this.renderInformation()
    }

    private static Settings() {
        let newFPS
        let settingsLoop = true
        this._isComingFromSettings = true
        this._isClockEnabled = false

        while (settingsLoop) {
            try {
                Console.ClearScreen()
                Console.WriteLine("SETTINGS:")
                Console.WriteLine("")
                Console.WriteLine("1            - Overwrite Dimension Limit")
                Console.WriteLine("2            - Set Dimensions")
                Console.WriteLine("3            - Set Simulation Frame Rate")
                Console.WriteLine(`4            - Reset Bounce Counter (Currently at ${DVDMoment.TotalBounces} bounces)`)
                Console.WriteLine("5            - Exit Settings")
                Console.WriteLine("")
                Console.WriteLine("")
                Console.WriteLine("OTHER SETTINGS:")
                Console.WriteLine("")
                Console.WriteLine(`901            - UnironicallyDisablePixelCleanup: ${TranslateCharacter.UnironicallyDisablePixelCleanup}`)

                if (!Screen.isInputError) {
                    Console.WriteLine("")
                }
                if (Screen.isInputError) {
                    Console.WriteLine(`${Screen.errorReason}`)
                    Screen.isInputError = false
                }

                const readIn = Console.ReadInt()

                if (readIn === 901) {
                    TranslateCharacter.UnironicallyDisablePixelCleanup = !TranslateCharacter.UnironicallyDisablePixelCleanup
                    this._rendererSelection = undefined
                    settingsLoop = false
                }

                switch (readIn) {
                    case 1:
                        Console.ClearScreen()
                        Console.WriteLine("### SETTINGS ###")
                        Console.WriteLine("Enter new limit")
                        this._maxResolution = Console.ReadInt()
                        break

                    case 2:
                        Console.ClearScreen()
                        this.Setup()
                        break

                    case 3:
                        Console.ClearScreen()
                        Console.WriteLine("### SETTINGS ###")
                        Console.WriteLine("Enter new FPS (anything higher than 10 may cause the console to flicker)")

                        newFPS = Console.ReadInt()
                        this._targetFPS = (1000 / newFPS)

                        break

                    case 4:
                        Console.ClearScreen()
                        DVDMoment.TotalBounces = 0
                        DVDMoment.TotalCornerBounces = 0

                        Screen.errorReason = `Counter reset done.`
                        throw new Error(`Counter reset done.`)

                    case 5:
                        this._rendererSelection = undefined
                        settingsLoop = false
                        break

                    default:
                        if (readIn === 901) break
                        Screen.errorReason = `Input must be a whole number.`
                        throw new Error(`Input must be a whole number.`)
                }
            } catch (error) {
                Screen.isInputError = true
            }
        }
    }

    private static renderInformation() {
        // needs filtering
        if (this._isShowingDebug) {
            Console.WriteLine('')
            Console.WriteLine('Debug:')
            Console.WriteLine(`COORDS | X: ${Screen.referenceX} Y: ${Screen.referenceY}`)
            Console.WriteLine(`SIZE   | W: ${Screen.width} H: ${Screen.height}`)
            Console.WriteLine(`FPS    | TARGET: ${(1000 / this._targetFPS).toFixed(2)} FPS  AVERAGE: ${FPSCounter.getFPS()} FPS  DURATION: ${this._renderDuration}ms`)
        }

        if (this._isShowingCommands) {
            Console.WriteLine('')
            Console.WriteLine("HELP:")
            Console.WriteLine("Q          - Opens this list")
            Console.WriteLine("D          - Opens Debug Info")
            Console.WriteLine("CTRL + C   - Closes Application")
            Console.WriteLine("CTRL + S   - Opens Settings")
            Console.WriteLine('')
            Console.WriteLine("Other Renderers:")
            Console.WriteLine("1          - DVD Mode")
            Console.WriteLine("2          - Draw a Line)")
            Console.WriteLine("3          - Draw a Line (With Character Control)")
            Console.WriteLine("4          - Explosion (it crashes the program lol)")
            Console.WriteLine("ESC        - Reset Renderer")
        }
    }

    // This is in fact, not the engine itself
    public static ConsolePixelEngine() {
        let exportedKeyName: any
        let exportedKeys: any

        // Set the terminal to raw mode
        readline.emitKeypressEvents(process.stdin);
        process.stdin.setRawMode(true);

        // Listen for the 'keypress' event
        process.stdin.on('keypress', (chunk, key) => {
            exportedKeyName = key.name
            exportedKeys = key

            if (!key) return

            if (!key.ctrl || !key.shift || !key.meta) {
                switch (key.name) {
                    case "d":
                        this._isShowingDebug = !(this._isShowingDebug)
                        this._isShowingCommands = false
                        break

                    case "q":
                        this._isShowingCommands = !(this._isShowingCommands)
                        this._isShowingDebug = false
                        break

                    case "escape":
                        Screen.ResetRendererConfig()
                        Screen.BuildScreenData()
                        Explosion.isBaseplateBuilt = false
                        this._rendererSelection = undefined
                        this._isClockEnabled = false
                        break

                    case "1":
                        if (this._rendererSelection === 1) return
                        if (this._rendererSelection === 4) return

                        this._isClockEnabled = true
                        this._rendererSelection = 1
                        Screen.startClock(exportedKeyName)
                        break

                    case "2":
                        Explosion.isBaseplateBuilt = false
                        this._isClockEnabled = false
                        this._rendererSelection = 2
                        break

                    case "3":
                        Explosion.isBaseplateBuilt = false
                        this._isClockEnabled = false
                        this._rendererSelection = 3
                        break

                    case "4":
                        if (this._rendererSelection === 1) return
                        if (this._rendererSelection === 4) return

                        this._isClockEnabled = true
                        this._rendererSelection = 4
                        Screen.startClock(exportedKeyName)
                        break

                    default:
                        break
                }
            }

            if (key.ctrl) {
                switch (key.name) {
                    case "c":
                        process.exit()

                    case "s":
                        this._rendererSelection = 0
                        break

                    default:
                        break
                }
            }

            // updates terminal with the specified key and rendering selection
            Screen.Render(exportedKeyName, this._rendererSelection)
            if (this._isShowingDebug) {
                Console.WriteLine(exportedKeys)
            }
        })

        // Enable the 'keypress' event for the stdin stream
        process.stdin.resume()
    }

    private static startClock(keyName: any) {
        if (this._isClockEnabled) {
            setTimeout(() => {
                Screen.Render(keyName, this._rendererSelection);
                this.startClock(keyName)
            }, this._targetFPS)
        }
    }

    public static PointGenerator(max: number): number {
        return Math.floor(Math.random() * max)
    }
}

class FPSCounter {
    private static lastFrameTime: number
    private static fps: number

    constructor() {
        FPSCounter.lastFrameTime = performance.now()
        FPSCounter.fps = 0
    }

    // Call this method each frame to update FPS
    public static updateFPS() {
        const currentTime = performance.now()
        const deltaTime = currentTime - this.lastFrameTime

        // Calculate FPS
        this.fps = 1000 / deltaTime

        // Store current time for the next frame
        this.lastFrameTime = currentTime
    }

    // Get the current FPS value
    public static getFPS(): string {
        return this.fps.toFixed(2)
    }
}

class TranslateCharacter {
    public static UnironicallyDisablePixelCleanup: boolean = false

    public static ToDirection(input: string | undefined) {
        // checks movement based on arrow keys
        if (input) {
            // do magic
            switch (input) {
                case "up":
                    this.moveUp();
                    break;

                case "right":
                    this.moveRight();
                    break;

                case "down":
                    this.moveDown();
                    break;

                case "left":
                    this.moveLeft();
                    break;

                default:
                    break;
            }
        }
    }

    private static moveUp() {
        this.removePixel()
        if (Screen.referenceY !== 0) {
            Screen.referenceY--
        }
        this.addPixel()
    }

    private static moveDown() {
        this.removePixel()
        if (Screen.referenceY !== (Screen.height - 1)) {
            Screen.referenceY++
        }
        this.addPixel()
    }

    private static moveRight() {
        this.removePixel()
        if (Screen.referenceX !== (Screen.width - 1)) {
            Screen.referenceX++
        }
        this.addPixel()
    }

    private static moveLeft() {
        this.removePixel()
        if (Screen.referenceX !== 0) {
            Screen.referenceX--
        }
        this.addPixel()
    }

    // handle refreshing of points
    private static removePixel() {
        if (!this.UnironicallyDisablePixelCleanup) {
            const obj: DimensionalArrayInterface[] = Screen.a2dArray;

            // turn off the current pixel based on reference
            obj[Screen.referenceY].data[Screen.referenceX] = Screen.pixelOff;
        }
    }

    private static addPixel() {
        const obj: DimensionalArrayInterface[] = Screen.a2dArray;

        // turn on the pixel based on result
        obj[Screen.referenceY].data[Screen.referenceX] = Screen.pixelOn;
    }
}

class DVDMoment {
    private static _angleA: boolean = false
    private static _angleB: boolean = false
    private static _angleC: boolean = true
    private static _angleD: boolean = false

    public static TotalBounces: number = 0
    public static TotalCornerBounces: number = 0

    static Bounce() {
        this.QueryPostion()

        if (this._angleA) {
            TranslateCharacter.ToDirection("up")
            TranslateCharacter.ToDirection("right")
        }
        if (this._angleB) {
            TranslateCharacter.ToDirection("down")
            TranslateCharacter.ToDirection("right")
        }
        if (this._angleC) {
            TranslateCharacter.ToDirection("down")
            TranslateCharacter.ToDirection("left")
        }
        if (this._angleD) {
            TranslateCharacter.ToDirection("up")
            TranslateCharacter.ToDirection("left")
        }
    }

    private static QueryPostion() {
        // top wall
        if (Screen.referenceY === 0) {
            if (this._angleA) {
                this._angleA = false
                this._angleB = true
                this.TotalBounces++
            }
            if (this._angleD) {
                this._angleD = false
                this._angleC = true
                this.TotalBounces++
            }
        }

        // right wall
        if (Screen.referenceX === (Screen.width - 1)) {
            if (this._angleA) {
                this._angleA = false
                this._angleD = true
                this.TotalBounces++
            }
            if (this._angleB) {
                this._angleB = false
                this._angleC = true
                this.TotalBounces++
            }
        }

        // bottom wall
        if (Screen.referenceY === (Screen.height - 1)) {
            if (this._angleB) {
                this._angleB = false
                this._angleA = true
                this.TotalBounces++
            }
            if (this._angleC) {
                this._angleC = false
                this._angleD = true
                this.TotalBounces++
            }
        }

        // left wall
        if (Screen.referenceX === 0) {
            if (this._angleC) {
                this._angleC = false
                this._angleB = true
                this.TotalBounces++
            }
            if (this._angleD) {
                this._angleD = false
                this._angleA = true
                this.TotalBounces++
            }
        }

        // Check corners 
        if ((Screen.referenceY === 0 && Screen.referenceX === 0) ||
            (Screen.referenceY === 0 && Screen.referenceX === (Screen.width - 1)) ||
            (Screen.referenceY === (Screen.height - 1) && Screen.referenceX === 0) ||
            (Screen.referenceY === (Screen.height - 1) && Screen.referenceX === (Screen.width - 1))
        ) {
            this.TotalCornerBounces++
        }
    }
}

class RenderLine {
    public static Draw() {
        Screen.ResetRendererConfig()

        // Obtain line AB
        const x1 = Screen.PointGenerator(Screen.width)
        const y1 = Screen.PointGenerator(Screen.height)

        const x2 = Screen.PointGenerator(Screen.width)
        const y2 = Screen.PointGenerator(Screen.height)

        // Initial Render
        Screen.BuildScreenDataIndependentlty()

        // Calculate Line
        RenderLine.BresenhamAlgorithm(x1, y1, x2, y2)
    }

    public static ExceptItsCharacterMode(input: string | undefined) {
        TranslateCharacter.ToDirection(input)

        const x1 = Screen.width / 2
        const y1 = Screen.height / 2

        const x2 = Screen.referenceX
        const y2 = Screen.referenceY

        // Initial Render
        Screen.BuildScreenDataIndependentlty()

        // Calculate Line
        RenderLine.BresenhamAlgorithm(x1, y1, x2, y2)
    }

    private static BresenhamAlgorithm(x1: number, y1: number, x2: number, y2: number) {
        if (isFloatNumber(x1)) {
            x1 = x1 - 0.5
        }
        if (isFloatNumber(y1)) {
            y1 = y1 - 0.5
        }

        let dx = Math.abs(x2 - x1)
        let dy = Math.abs(y2 - y1)
        let incX = x1 < x2 ? 1 : -1
        let incY = y1 < y2 ? 1 : -1
        let error = dx - dy

        this.DrawPixel(x1, y1)

        while (x1 !== x2 || y1 !== y2) {
            const error2 = error * 2

            if (error2 > -dy) {
                error -= dy
                x1 += incX
            }

            if (error2 < dx) {
                error += dx
                y1 += incY
            }

            this.DrawPixel(x1, y1)
        }

        function isFloatNumber(value: any): boolean {
            return typeof value === 'number' && Number.isFinite(value) && value % 1 !== 0;
        }
    }

    private static DrawPixel(x: number, y: number) {
        try {
            const obj: DimensionalArrayInterface[] = Screen.a2dArray
            obj[y].data[x] = Screen.pixelOn
        } catch (error) {
            // Renderer just went out of bounds
        }
    }
}

class Explosion {
    public static isBaseplateBuilt: boolean = false
    private static _pointPlotterX: number[] = []
    private static _pointPlotterY: number[] = []

    private static _newPlotterX: number[] = []
    private static _newPlotterY: number[] = []
    private static _newPlotterCopyX: number[] = []
    private static _newPlotterCopyY: number[] = []

    private static _resetCounter: number = 0

    public static JustDoIt() {

        if (this.isBaseplateBuilt) {
            this._newPlotterX = this._pointPlotterX
            this._newPlotterCopyX = this._pointPlotterX
            this._newPlotterY = this._pointPlotterY
            this._newPlotterCopyY = this._pointPlotterY
            this._pointPlotterX = []
            this._pointPlotterY = []

            for (let i = 0; i < this._newPlotterX.length; i++) {
                this.Expand(this._newPlotterX[i], this._newPlotterY[i])
            }
            // Console.WriteLine(this._pointPlotterX)
            // Console.WriteLine(this._pointPlotterY)

            this._resetCounter++

            if (this._resetCounter >= Screen.width ||
                this._resetCounter >= Screen.height) {
                this._resetCounter = 0
                this.isBaseplateBuilt = false
            }
        }

        if (!this.isBaseplateBuilt) {
            this._newPlotterX = []
            this._newPlotterY = []
            this._newPlotterCopyX = []
            this._newPlotterCopyY = []
            this._pointPlotterX = []
            this._pointPlotterY = []
            Screen.BuildScreenDataIndependentlty()

            const x = Screen.PointGenerator(Screen.width)
            const y = Screen.PointGenerator(Screen.height)

            const obj: DimensionalArrayInterface[] = Screen.a2dArray
            obj[y].data[x] = Screen.pixelOn

            this.Expand(x, y)
            this.isBaseplateBuilt = true
            // Console.WriteLine(this._pointPlotterX)
            // Console.WriteLine(this._pointPlotterY)
        }

        try {
            for (let i = 0; i < this._pointPlotterX.length; i++) {
                const obj: DimensionalArrayInterface[] = Screen.a2dArray

                if (this._pointPlotterX[i] > Screen.width || this._pointPlotterX[i] < 0) return
                if (this._pointPlotterY[i] > Screen.height || this._pointPlotterY[i] < 0) return
                obj[this._pointPlotterY[i]].data[this._pointPlotterX[i]] = Screen.pixelOn
            }
        } catch (error) {

        }
    }

    private static Expand(x: number, y: number) {
        // move up
        let top = y + 1
        // move right
        let right = x + 1
        // move down
        let down = y - 1
        // move left
        let left = x - 1

        if (top > Screen.height) top = top - 1
        if (right > Screen.width) right = right - 1
        if (down < 0) down = down + 1
        if (left < 0) left = left + 1

        if (top > 0 && top < Screen.height) {
            let isFound = false
            for (const i of this._newPlotterCopyY) {
                if (i === top) {
                    isFound = true
                }
            }
            if (!isFound) {
                this._pointPlotterX.push(x)
                this._pointPlotterY.push(top)
            }
        }
        if (right > 0 && right < Screen.width) {
            let isFound = false
            for (const i of this._newPlotterCopyX) {
                if (i === right) {
                    isFound = true
                }
            }
            if (!isFound) {
                this._pointPlotterX.push(right)
                this._pointPlotterY.push(y)
            }
        }
        if (down > 0 && down < Screen.height) {
            let isFound = false
            for (const i of this._newPlotterCopyY) {
                if (i === down) {
                    isFound = true
                }
            }
            if (!isFound) {
                this._pointPlotterX.push(x)
                this._pointPlotterY.push(down)
            }
        }
        if (left > 0 && left < Screen.width) {
            let isFound = false
            for (const i of this._newPlotterCopyX) {
                if (i === left) {
                    isFound = true
                }
            }
            if (!isFound) {
                this._pointPlotterX.push(left)
                this._pointPlotterY.push(y)
            }
        }
    }
}


export class Console {
    public static ReadLine(x?: any) {
        const prompt = require('prompt-sync')()
        return prompt(x)
    }

    public static WriteLine(message: any, params?: any[]) {
        if (params === undefined || null) {
            console.log(message)
            return
        }
        console.log(message, params)
    }

    public static Write(message: any, ...params: any[]): void {
        process.stdout.write(message.toString());
        if (params.length > 0) {
            process.stdout.write(' ' + params.join(' '));
        }
    }

    public static ReadInt(): number {
        const input = Console.ReadLine()
        const numericRegex = /^\d+$/;

        if (!numericRegex.test(input)) {
            Screen.errorReason = "Input must be a whole number."
            throw new Error("Input must be a whole number.")
        }

        const numericInput = parseInt(input, 10)

        return numericInput
    }

    public static ClearScreen() {
        // ANSI escape code for clearing the screen
        console.log('\x1Bc')
    }
}

// Start the process :3
Screen.Main()