import { fixedAndFlashing, compositeGroupOcculting, longFlashing, groupQuick, groupLongFlashing, interruptedQuick, groupQuickByLongFlash } from "./characteristics.js"


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

animate(groupQuickByLongFlash(12000, 6))