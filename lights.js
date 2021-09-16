import { alternating, COLOR_WHITE, COLOR_GREEN, COLOR_RED, flashing} from "./characteristics.js"


function convertToRelativeKeyFrames(keyframes, duration) {
    const relativeKeyFrames = []
    for(let keyframe of keyframes) {
        relativeKeyFrames.push({
            ...keyframe,
            offset: (keyframe.offset || 0)/ duration
        })
    }
    return relativeKeyFrames
}

export function animate([keyframes, duration]) {
    const lightElement = document.getElementById("light")
    lightElement.animate(convertToRelativeKeyFrames(keyframes, duration), {
        duration: duration,
        iterations: Infinity
    })
} 

// animate(alternating(6000, [COLOR_WHITE, COLOR_GREEN, COLOR_RED]))
animate(flashing(1000)) 