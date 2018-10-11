let animationInterval;

stopAnimation = () => {
    
}

startAnimation = () => {
    const slideWidth = 128;
    var offsetPixels = 0;
    animationTarget = document.getElementById("pacman");
    
    animationInterval = setInterval(() => {
        animationTarget.style.backgroundPosition =
        `-${offsetPixels}px 0px`;
        
        if (offsetPixels < (slideWidth*3)) {
            offsetPixels = offsetPixels + slideWidth;
        } else {
            offsetPixels = 0;
        }
    }, 100);
}