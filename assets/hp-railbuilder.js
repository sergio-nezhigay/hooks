function colour_update(hook) {
    // console.log(hook);
    var colour = hook.value;
    // console.log(colour);
    var target = document.querySelector(".active-railbuilder [data-image-position='" + hook.dataset.hookTarget + "'");
    // console.log(target);
    target.setAttribute('data-colour', colour);
}
