export const COLOR_WHITE = 'white';
export const COLOR_RED = 'red';
export const COLOR_GREEN = 'green';

const O_ON = (color = COLOR_WHITE) => {return {
    color: color,
    opacity: 1
}}

const O_DIM = (color = COLOR_WHITE) => {return {
    opacity: 0.4,
    color: COLOR_WHITE
}}
const O_OFF = {
    opacity: 0.001,
    color: COLOR_WHITE
}

const FLASH_DURATION = 200;
const QUICK_FLASH_DURATION = 60*1000.0 / 70.0;
const VERY_QUICK_FLASH_DURATION = 60*1000.0 / 90.0;

function combine(...animations) {
    let finalDuration = 0
    let finalKeyframes = []
    for (let [keyframes, duration] of animations) {
        for (let keyframe of keyframes) {
            finalKeyframes.push(
                {
                    ...keyframe,
                    offset: (keyframe.offset || 0) + finalDuration
                }
            )
        }
        finalDuration += duration
    }
    return [finalKeyframes, finalDuration]
}

function compositeGroup(period, groupOnIntensity, groupOffIntensity, onDuration, offDuration, ...groups) {
    const totalDims = groups.reduce((a, b) => a + b)
    const totalDimsDuration = (onDuration + offDuration) * totalDims
    if (totalDimsDuration > period) {
        throw "total duration of dims exceeds total period"
    }

    const longFlashDuration = (period - totalDimsDuration) / groups.length;

    const lights = []
    for (let inGroup of groups) {
        for (let i = 0; i < inGroup; i++) {
            lights.push(...[fixed(onDuration, groupOnIntensity), fixed(offDuration, groupOffIntensity)])
        }
        lights.push(...[fixed(longFlashDuration, groupOffIntensity)])
    }


    return combine(
        ...lights,
    )
}


//F
export function fixed(duration = Infinity, light = O_ON(COLOR_WHITE)) {
    const keyframes = [
        {
            opacity: light.opacity,
            backgroundColor: light.color,
            easing: 'steps(1, end)',
            // easing: 'cubic-bezier(0.8, 0, 1,0)'
        },
    ]
    return [keyframes, duration]
}


//FFl(x)
export function fixedAndFlashing(period, inGroup = 1) {
    const flashes = []

    for (let i = 0; i < inGroup; i++) {
        flashes.push(...[fixed(FLASH_DURATION, O_ON(COLOR_WHITE)), fixed(FLASH_DURATION, O_DIM(COLOR_WHITE))])
    }

    const durationOfFlashes = FLASH_DURATION * 2 * inGroup;
    if (durationOfFlashes > period) {
        throw "duration of flashes exceeds total period"
    }

    return combine(
        ...flashes,
        fixed(period - durationOfFlashes, O_DIM(COLOR_WHITE))
    )
}

//Oc
export function occulting(period) {
    if (period < 1500) {
        throw "period of occulting light cannot be shorter than 1.5s"
    }

    return combine(
        fixed(0.7 * period, O_ON(COLOR_WHITE)),
        fixed(0.3 * period, O_OFF)
    );
}

//Oc(x)
export function groupOcculting(period, dims = 2) {
    return compositeGroupOcculting(period, dims)
}

//Oc(x+y)
export function compositeGroupOcculting(period, ...dimGroups) {
    return compositeGroup(period, O_OFF, O_ON(COLOR_WHITE), FLASH_DURATION, FLASH_DURATION, dimGroups)
}

//Fl(x)
export function groupFlashing(period, inGroup) {
    return compositeGroupFlashing(period, inGroup)
}

//Fl(x+y)
export function compositeGroupFlashing(period, ...groups) {
    return compositeGroup(period, O_ON(COLOR_WHITE), O_OFF, FLASH_DURATION, FLASH_DURATION, groups)
}

//Fl
export function flashing(period) {
    return compositeGroupFlashing(period, 1)
}

//LFl
export function longFlashing(period) {
    if(period < 3000) {
        throw "LFl period cannot be shorter than 3s"
    }
    return compositeGroup(period, O_ON(COLOR_WHITE), O_OFF, 2500, 500, 1)
}

//LFl(x)
export function groupLongFlashing(period, inGroup) {
    return compositeGroupLongFlashing(period, inGroup)
}

//LFl(x+y)
export function compositeGroupLongFlashing(period, ...groups) {
    if(period < 3000) {
        throw "LFl period cannot be shorter than 3s"
    }
    return compositeGroup(period, O_ON(COLOR_WHITE), O_OFF, 2500, 500, groups)
}

//Iso
export function iso(period) {
    return combine(
        fixed(0.5 * period, O_ON(COLOR_WHITE)),
        fixed(0.5 * period, O_OFF)
    );
}

function blinking(period, minimumFrequency) {
    if(period > 60*1000 / minimumFrequency) {
        throw "quick's frequency must be > "+minimumFrequency + " blinks/minute"
    }

    return combine(
        fixed(0.1*period, O_OFF),
        fixed(0.9*period, O_ON(COLOR_WHITE))
    )
}

function groupBlinking(period, flashDuration, flashes = 1) {
    return compositeGroup(period, O_ON(COLOR_WHITE), O_OFF, flashDuration/2, flashDuration/2, flashes)
}

function interruptedBlinking(period, flashDuration) {
    const dimStageLength = period-flashDuration*8;
    if(dimStageLength<3000) {
        throw "dim stage in interrupted light must of length > 3s, but is " + dimStageLength
    }
    return compositeGroup(period, O_ON(COLOR_WHITE), O_OFF, flashDuration/2, flashDuration/2, 8)
}

function groupBlinkingByLongFlash(period, flashDuration, flashes) {
    const groupBlinkingDuration = flashDuration*flashes;
    const longFlashDuration = (period-groupBlinkingDuration)/2;

    return combine(
        groupQuick(groupBlinkingDuration, flashes),
        fixed(longFlashDuration, O_ON(COLOR_WHITE)),
        fixed(longFlashDuration, O_OFF)
    )
}

//Q
export function quick(period = 120) {
    return blinking(period, 50)
}

//Q(x)
export function groupQuick(period, flashes = 1) {
    return groupBlinking(period, QUICK_FLASH_DURATION, flashes)
}

//IQ
export function interruptedQuick(period) {
    return interruptedBlinking(period, QUICK_FLASH_DURATION)
}

//Q(x)+LFI
export function groupQuickByLongFlash(period, flashes) {
    return groupBlinkingByLongFlash(period, QUICK_FLASH_DURATION, flashes)
}

//VQ
export function veryQuick(period = 180) {
    return blinking(period, 80)
}

//VQ(x)
export function veryQuickGroup(period, flashes = 1) {
    return groupBlinking(period, VERY_QUICK_FLASH_DURATION, flashes)
}

//IVQ
export function interruptedVeryQuick(period) {
    return interruptedBlinking(period, VERY_QUICK_FLASH_DURATION)
}

//VQ(x)+LFI
export function groupVeryQuickByLongFlash(period, flashes) {
    return groupBlinkingByLongFlash(period, VERY_QUICK_FLASH_DURATION, flashes)
}


export function alternating(period, colors) {
    const singleColorPeriod = period / colors.length
    const lights = []
    for(let color of colors) {
        lights.push(fixed(singleColorPeriod, O_ON(color)))
    }

    return combine(
        ...lights
    )
}