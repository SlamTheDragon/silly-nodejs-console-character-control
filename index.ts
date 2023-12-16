import * as readline from 'readline';

// The starting point of this script is initiated at the very last line of this document

// just something to explicitly define the form of an object to avoid errors
interface DimensionalArrayInterface {
    value: number;
    data: string[];
}

class Screen {
    // error handling
    public static errorReason: string | undefined
    private static _didInputError: boolean = false

    // screen properties
    private static _maxResolution: number = 32
    private static _width: number = 0
    private static _height: number = 0
    private static _pixelOff: string = "\x1b[48;5;8m  \x1b[0m"
    private static _pixelOn: string = "\x1b[48;5;15m  \x1b[0m"

    // rendering
    private static _initialRender: boolean = false
    private static _initialCharacter: boolean = false
    private static _2dArray: DimensionalArrayInterface[] = []

    private static _referenceX: number = 0
    private static _referenceY: number = 0


    static Main() {
        Console.ClearScreen()
        const a = Console.ReadLine("Welcome to the random algorithm thingy, press enter to continue.")
        Console.ClearScreen()
        this.SetUp()
    }

    private static SetUp() {
        // begin setup
        while (true) {
            try {
                if (this._didInputError) {
                    Console.WriteLine(`Error: ${this.errorReason}`)
                    this._didInputError = false
                }

                Console.WriteLine("Define Grid Width:")
                this._width = Console.ReadInt()

                Console.ClearScreen()
                Console.WriteLine("Define Grid Height:")
                this._height = Console.ReadInt()
                evaluateInputs()

                break
            } catch (e) {
                this._didInputError = true
                Console.ClearScreen()
            }
        }

        // start
        this.Render()
        this.ConsolePixelEngine()

        // assistive functions
        
        function evaluateInputs() {
            if ((Screen._width || Screen._height) === 0) throwReport()
            else if (Screen._width > Screen._maxResolution || Screen._height > Screen._maxResolution) throwReport()
        }

        function throwReport() {
            Screen.errorReason = `Width and Height values must be greater than 0 or equal to 24. ${Screen._maxResolution}`
            throw new Error(`Width and Height values must be greater than 0 or equal to 24. ${Screen._maxResolution}`)
        }
    }


    private static Render(input?: string) {
        // creates screen if not yet created
        if (!this._initialRender) {
            for (let i = 0; i < this._height; i++) {
                let obj: { value: number, data: string[] } = { value: i, data: [] }

                for (let j = 0; j < this._width; j++) {
                    obj.data.push(this._pixelOff)
                }

                this._2dArray.push(obj)
            }

            this._initialRender = true
        }

        // initiates character if not yet initiated
        if (!this._initialCharacter) {
            const obj: DimensionalArrayInterface[] = this._2dArray
            obj[0].data[0] = this._pixelOn

            this._initialCharacter = true
        }

        // checks movement based on arrow keys
        if (input) {
            const obj: DimensionalArrayInterface[] = Screen._2dArray

            // turn off the current pixel based on reference
            obj[Screen._referenceY].data[Screen._referenceX] = Screen._pixelOff

            // do magic
            switch (input) {
                case "up":
                    this.moveUp()
                    break

                case "right":
                    this.moveRight()
                    break

                case "down":
                    this.moveDown()
                    break

                case "left":
                    this.moveLeft()
                    break

                default:
                    break
            }

            // turn on the pixel based on result
            obj[Screen._referenceY].data[Screen._referenceX] = Screen._pixelOn
        }

        // decodes 2D array into an identifiable-looking interface
        let renderAccumulator = ""

        Console.ClearScreen()
        Console.WriteLine("Press Ctrl + C to Exit. Use arrow keys to move.")
        for (let col = 0; col < this._2dArray.length; col++) { // opens the "columns" of the 2d array

            for (let row = 0; row < this._2dArray[col].data.length; row++) { // exports the "rows" to the renderAccumulator by using the "column" index as reference
                const outVal = this._2dArray[col].data[row];
                renderAccumulator = renderAccumulator + outVal
            }
            Console.WriteLine(renderAccumulator)

            renderAccumulator = "" // reset to avoid stacking
        }
        Console.WriteLine('')
        Console.WriteLine('Debug:')
        Console.WriteLine(`COORDS | X: ${this._referenceX} Y: ${this._referenceY}`)
        Console.WriteLine(`DIM... | W: ${this._width} H: ${this._height}`)
    }

    /**
     * Reasoning time :D
     * 
     * Assuming that the character is in col 1, row 1
     * we can create a reference point from there
     * and use the reference point to relay information
     * on which cell it can move or so to say... the "character"
     * 
     * We can then declare:
     * _referenceX
     * _referenceY
     * as a direct representation of _width & _height except
     * it's under the scope of the character
     * 
     * However, the "character" will disappear if we get beyond
     * the scope of the defined dimensions of _width & _height 
     * theoretically speaking.
     * 
     * Reason? We're just swapping cells by replacing them with
     * the correct character. Anything beyond that leads to an
     * error, which then will be handled.
     * 
     * How can we implement these concepts?
     * Asssuming that we can just move the pixel easily from 
     * left to right... We could just increment and decrement
     * the reference variables which we can pass to the said 
     * row based on the reference variables.
     * [trying to implement before proceeding]
     * 
     * damn actually i thought it was harder than the one I implemented.
     * 
     * Now I'm assuming that it goes the same with up and down soo...
     * [trying to implement before proceeding]
    */


    private static moveUp() {
        if (this._referenceY !== 0) {
            this._referenceY--
        }
    }

    private static moveDown() {
        if (this._referenceY !== (this._height - 1)) {
            this._referenceY++
        }
    }

    private static moveRight() {
        if (this._referenceX !== (this._width - 1)) {
            this._referenceX++
        }
    }

    private static moveLeft() {
        if (this._referenceX !== 0) {
            this._referenceX--
        }
    }



    private static ConsolePixelEngine() { // thanks chatgpt, C# acts different when it comes to reading terminal keystrokes so...
        // Set the terminal to raw mode
        readline.emitKeypressEvents(process.stdin);
        process.stdin.setRawMode(true);

        // Listen for the 'keypress' event
        process.stdin.on('keypress', (chunk, key) => {
            if (key && key.ctrl && key.name === 'c') {
                process.exit(); // Exit the program on Ctrl+C
            } else {
                // updates terminal with the specified movement key
                this.Render(key.name)
            }
        });

        // Enable the 'keypress' event for the stdin stream
        process.stdin.resume();
    }
}


export class Console {
    public static ReadLine(x?: any) {
        const prompt = require('prompt-sync')()
        return prompt(x)
    }

    public static WriteLine(message: any, params?: any[] | unknown) {
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
            Screen.errorReason = "Input must be a number."
            throw new Error("Input must be a number.")
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