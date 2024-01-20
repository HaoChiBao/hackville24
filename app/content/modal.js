class MouseWheel{
    // element of the mouse modal
    mouseModal = null

    // elements for the slices of the wheel
    wheelPieces = []

    // offset rotate represents the additional rotation css of the wheel
    // this is done so that one of the slices is always pointing up
    offsetRotate = 0

    // variable for the number of slices
    MAX_DEGREES = 360
    SPACE_BETWEEN_SLICES = 1
    numSlices = null
    currentActiveSlice = null


    // variable for if the wheel should be active
    #active = false;

    // variable for when to activate a slice based on the distance (in PX) from the center of the wheel
    #activationDistance = 70

    #state = {
        controlHold: false,
        activationHold: false,
        activationKey: 'Control',
    }

    // variable for the current active slice
    userSettings = {
        staticBorders: false,
        modalSize: 300,
    }

    constructor(numSlices) {
        console.log('loading mousewheel')
        
        this.numSlices = numSlices
        try {

            this.mouseModal = MouseWheel.createMouseModal(this.userSettings.modalSize)
            
            this.offsetRotate =  0 - (this.MAX_DEGREES / (this.numSlices * 2) + 90)

            this.loadModal()

            if(this.numSlices !== null) {this.addCompleteWheel(this.numSlices)}

            console.log('mousewheel loaded')

        } catch (error) {

            console.log('failed to load mousewheel ERROR:', error)
        }

        // this.addWheelPiece(70)
    }

    loadModal = () => {
        const loadKeyEvents = () => {
            // activation key
            window.addEventListener('keydown', (e) => {
                const key = e.key
                if(key === this.#state.activationKey) {
                    this.#state.activationHold = true
                }
            })
            
            window.addEventListener('keyup', (e) => {
                const key = e.key
                if(key === this.#state.activationKey) {
                    this.#state.activationHold = false
                    this.deactivate()
                }
            })
        }

        const loadMouseEvents = () => {
            // control key
            window.addEventListener('mousedown', (e) => {
                const key = e.button
                if(key === 0) {
                    this.#state.controlHold = true
        
                    if(this.#state.activationHold) {
                        const mPoints = {x: e.clientX, y: e.clientY}
                        this.setWheelPosition(mPoints.x, mPoints.y)
                        this.activate(e)
                    }
        
                }

            })
            
            window.addEventListener('mouseup', (e) => {
                const key = e.button
                if(key === 0) {
                    this.#state.controlHold = false

                    const wheelPoints = this.getRelativeMidPoint()
                    const mousePoints = {x: e.clientX, y: e.clientY}
                    const distance = MouseWheel.distanceBetweenTwoPoints(wheelPoints, mousePoints)

                    // console.log(wheelPoints)
                    if(this.isActive() && distance > this.#activationDistance && this.currentActiveSlice != null) {
                        this.triggerWheelEvent(this.currentActiveSlice, wheelPoints.x, wheelPoints.y)
                    }

                    this.deactivate()
                }
            })
            window.addEventListener('mousemove', (e) => {
                // console.log(this.currentActiveSlice)
                if(this.isActive()){
                    const wheelPoints = this.getRelativeMidPoint()
                    const mousePoints = {x: e.clientX, y: e.clientY}

                    // console.log(wheelPoints, mousePoints)

                    const slope = MouseWheel.slopeFromTwoPoints(wheelPoints, mousePoints)
                    const quadrant = MouseWheel.quadrantFromTwoPoints(wheelPoints, mousePoints)
                    const angle = MouseWheel.angleFromSlope(slope, quadrant) - this.offsetRotate

                    const distance = MouseWheel.distanceBetweenTwoPoints(wheelPoints, mousePoints)

                    // console.log(angle)
                    // console.log(distance)
                    const wheelSlice = this.getSliceInAngle(angle)

                    // console.log(wheelSlice)
                    // console.log(angle, quadrant)

                    if(wheelSlice != null && distance > this.#activationDistance) {
                        this.activateSlice(wheelSlice.id)

                        if(!this.userSettings.staticBorders) {
                            const borderSlice = this.mouseModal.querySelector('.wheelContainer .wheelBorder')
                            borderSlice.style.opacity = 1
                            borderSlice.style.transform = `rotate(${angle + this.offsetRotate + 90}deg)`
                        }
                    } else if (distance < this.#activationDistance) {
                        this.deactivateAllSlices()
                    }
                }
            })
        }

        loadKeyEvents();loadMouseEvents()

        return 0;
    }

    triggerWheelEvent = (elementNum, x, y) => {
        switch(elementNum) {
            case 0:
                console.log('sticker')
                break;
            case 1:
                console.log('annotation')
                startAnnotation(x, y)
                break;
            case 2:
                console.log('random')
                break;
            default:
                console.log('element:', elementNum, 'not found')
                break;

        }
    }
    
    static getCircleXY = (degree) => {
        if(degree < 0 || degree > 360) throw new Error('degree must be between 0 and 360')
        
        const radian = degree * Math.PI / 180
        
        let x = null
        let y = null
        
        if(degree == 90 || degree == 270) {
            x = 0
        } else {
            x = Math.cos(radian)
        }
        
        if(degree == 0 || degree == 180 || degree == 360) {
            y = 0
        }
        else {
            y = Math.sin(radian)
        }
        
        return {x: x, y: y}
    }

    static createMouseModal = (size) => {
        
        const mouseModal = document.createElement('div')
        mouseModal.className = 'mouseModal'
        mouseModal.style.width = `${size}px`
        
        const wheelNose = document.createElement('div')
        wheelNose.className = 'wheelNose'
        
        mouseModal.appendChild(wheelNose)
        document.body.appendChild(mouseModal)

        return mouseModal
    }

    static slopeFromTwoPoints = (point1, point2) => {
        const slope = (point2.y - point1.y) / (point2.x - point1.x)
        // return slope and quadrant
        return slope
    }

    // quadrant from two points where the first point is the origin
    static quadrantFromTwoPoints = (point1, point2) => {
        if(point1.x > point2.x && point1.y > point2.y) {
            return 3
        } else if(point1.x < point2.x && point1.y > point2.y) {
            return 4
        } else if(point1.x < point2.x && point1.y < point2.y) {
            return 1
        }
        else if(point1.x > point2.x && point1.y < point2.y) {
            return 2
        }
        else {
            return 0
        }
    }

    static distanceBetweenTwoPoints = (point1, point2) => {
        const x = point2.x - point1.x
        const y = point2.y - point1.y
        return Math.sqrt(x*x + y*y)
    }

    static angleFromSlope = (slope, quadrant = null) => {
        const angle = Math.atan(slope) * 180 / Math.PI
        

        if(quadrant !== null) {
            if(quadrant === 2) {
                return 180 + angle
            } else if(quadrant === 3) {
                return 180 + angle
            } else if(quadrant === 4) {
                return 360 + angle
            }
        }

        // console.log(angle, quadrant)

        return angle 
    }

    static rotateElement = (element, degree) => {
        element.style.transform = `rotate(${degree}deg)`
    }

    getSliceInAngle = (angle) => {
        angle =  (angle) % 360
        for(let i = 0; i < this.wheelPieces.length; i++) {
            const wheelPiece = this.wheelPieces[i]

            const highend = wheelPiece.rotate + wheelPiece.angle
            const lowend = wheelPiece.rotate
            // console.log(angle, wheelPiece.rotate, wheelPiece.angle)
            if(angle < highend && angle > lowend ) {
                return wheelPiece
            }
        }
        return null
    }

    // return a wheel piece element
    createWheelPiece = (degree, rotate = 0) => {
        const unitCoordinates = MouseWheel.getCircleXY(degree)
        
        // factor to fill in the slices of the circle
        const fillMultiplier = 2;
    
        // 3/4 of the degree
        const align1Point = MouseWheel.getCircleXY(3*degree/4)
        
        // mid point of the degree
        const align2Point = MouseWheel.getCircleXY(degree/2)
        
        // quarter of the degree
        const align3Point = MouseWheel.getCircleXY(degree/4)
        // console.log(unitCoordinates)
    
        const wheelCoordinates = {
            x: unitCoordinates.x * 50 * fillMultiplier + 50,
            y: unitCoordinates.y * 50 * fillMultiplier + 50,
        }
    
        const alignmentPoint1 = {
            x: align1Point.x * 50 * fillMultiplier + 50,
            y: align1Point.y * 50 * fillMultiplier + 50,
        }
    
        const alignmentPoint2 = {
            x: align2Point.x * 50 * fillMultiplier + 50,
            y: align2Point.y * 50 * fillMultiplier + 50,
        }
    
        const alignmentPoint3 = {
            x: align3Point.x * 50 * fillMultiplier + 50,
            y: align3Point.y * 50 * fillMultiplier + 50,
        }
    
    
        // console.log(wheelCoordinates)
        // console.log(alignmentPoint2)
        
        const wheelContainer = document.createElement('div')
        wheelContainer.className = 'wheelContainer'
        wheelContainer.id = `wc${this.wheelPieces.length}`

        // create wheel piece
        const wheelPiece = document.createElement('div')
        wheelPiece.className = 'wheelPiece'
        wheelPiece.id = `wp${this.wheelPieces.length}`
        wheelPiece.style.clipPath = `polygon(200% 50%, 50% 50%, ${wheelCoordinates.x}% ${wheelCoordinates.y}%, ${alignmentPoint1.x}% ${alignmentPoint1.y}%, ${alignmentPoint2.x}% ${alignmentPoint2.y}%, ${alignmentPoint3.x}% ${alignmentPoint3.y}%)`
        wheelPiece.style.transform = `rotate(${rotate}deg)`
        
        // create border for the wheel piece
        const wheelBorder = document.createElement('div')
        wheelBorder.className = 'wheelBorder'
        wheelBorder.id = `wb${this.wheelPieces.length}`
        wheelBorder.style.clipPath = `polygon(200% 50%, 50% 50%, ${wheelCoordinates.x}% ${wheelCoordinates.y}%, ${alignmentPoint1.x}% ${alignmentPoint1.y}%, ${alignmentPoint2.x}% ${alignmentPoint2.y}%, ${alignmentPoint3.x}% ${alignmentPoint3.y}%)`
        wheelBorder.style.transform = `rotate(${rotate}deg)`
        wheelBorder.style.opacity = 0;

        const wheelContent = document.createElement('div')
        wheelContent.className = 'wheelContent'
        wheelContent.id = `content${this.wheelPieces.length}`
        
        // align the content to be centered along the slope of the wheel piece based on the midpoint of the wheel content
        wheelContent.style.left = `${align2Point.x*25 + 50 - 20}%` // this equation took so fucking long
        wheelContent.style.top = `${align2Point.y*25 + 50 - 20}%` // its the mid point of the angle * half the radius of the circle (move over 50%) and minus 20% for half of the wheelContent width

        const rotateContent = MouseWheel.angleFromSlope(MouseWheel.slopeFromTwoPoints({x:50, y:50}, alignmentPoint2))
        wheelContent.style.transform = `rotate(${rotateContent}deg)`
        
        // add content to wheel piece
        wheelPiece.appendChild(wheelContent)

        // add border to wheel piece
        // add wheel piece to wheel container
        wheelContainer.appendChild(wheelBorder)
        wheelContainer.appendChild(wheelPiece)

        return wheelContainer
    }

    // add a single wheel piece
    addWheelPiece = (degree, rotate = 0) => {
        if(degree === undefined) throw new Error('include a degree')

        const wheelPiece = this.createWheelPiece(degree, rotate)
        
        // add wheel piece to mouse modal and wheel pieces array
        this.mouseModal.appendChild(wheelPiece)
        this.wheelPieces.push(
            {
                wheelPiece: wheelPiece,
                angle: degree,
                rotate: rotate,
                id: this.wheelPieces.length,
            }
        )

        return 0
    }

    // add a complete wheel with numSlices
    addCompleteWheel = (numSlices) => {

        let degreesPerSlice = this.MAX_DEGREES / numSlices

        for(let ams = 0; ams < numSlices; ams++) {
            this.addWheelPiece(degreesPerSlice - this.SPACE_BETWEEN_SLICES, ams * degreesPerSlice)
        }

    }

    // get the midpoint of the mouse modal based on where it is on the screen
    getRelativeMidPoint = () => {
        // get bounding box of mouse modal

        const mouseModalBoundingBox = this.mouseModal.getBoundingClientRect()
        const midPoint = {
            x: mouseModalBoundingBox.x + mouseModalBoundingBox.width / 2,
            y: mouseModalBoundingBox.y + mouseModalBoundingBox.height / 2,
        }

        return midPoint
    }

    // set the position of the mouse modal X and Y
    setWheelPosition = (x, y) => {
        // get half the width of the mouse modal
        const offset = this.mouseModal.getBoundingClientRect().width / 2

        this.mouseModal.style.left = `${x-offset}px`
        this.mouseModal.style.top = `${y-offset}px`
    }

    activateSlice = (sliceNum) => {
        
        const sliceInfo = this.getSlice(sliceNum)
        
        const wheelContainer = sliceInfo.wheelPiece
        const children = wheelContainer.children

        const wheelBorder = children[0]
        const wheelSlice = children[1]
        
        wheelSlice.style.background = 'radial-gradient(#00000000, rgba(254, 254, 254, 0.753))'
        
        if(this.userSettings.staticBorders) wheelBorder.style.opacity = 1
        
        this.deactivateAllSlices(sliceNum)

        this.currentActiveSlice = sliceNum
    }
    
    deactivateSlice = (sliceNum) => {
        this.currentActiveSlice = null

        const sliceInfo = this.getSlice(sliceNum)

        const wheelContainer = sliceInfo.wheelPiece
        const children = wheelContainer.children

        const wheelBorder = children[0]
        const wheelSlice = children[1]

        wheelSlice.style.background = 'radial-gradient(#00000000, rgba(147, 147, 147, 0.753))'

        wheelBorder.style.opacity = 0
    }

    // deactivate all slices (except for the notSlice)
    deactivateAllSlices = (notSlice = null) => {
        for(let i = 0; i < this.wheelPieces.length; i++) {
            if(i !== notSlice) this.deactivateSlice(i)
        }
    }

    getSlice = (slice) => {
        return this.wheelPieces[slice]
    }

    // set activate to true
    activate = (event) => {
        this.#active = true
        event.preventDefault()
        MouseWheel.rotateElement(this.mouseModal, this.offsetRotate)
    }
    
    // set activate to false and move the mouse modal off screen
    deactivate = () => {
        this.#active = false
        this.setWheelPosition(-1000, -1000)
        this.deactivateAllSlices()
        MouseWheel.rotateElement(this.mouseModal, 0)
    }

    // return if the mouse wheel is active
    isActive = () => {
        return this.#active
    }

    // set the state of the mouse wheel
    getState = () => {
        return this.#state
    }
}


window.onload = () => {
    const test_slices = 2
    
    const mouseWheel = new MouseWheel(test_slices)
    // console.log(mouseWheel)
}
