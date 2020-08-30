$(document).ready(function () {
    var elements = $('.exportable');
    var index = 0;

    var doNext = null;
    doNext = function () {
        var element = elements.eq(index);
        $(element).addClass('scale-up');
        // do work 
        window.scrollTo(0, 0);
        html2canvas(element[0],
            {
                backgroundColor: null,
                allowTaint: true,
            }).then(function (canvas) {
                document.body.appendChild(canvas);
                var dataURL = canvas.toDataURL();

                $.ajax({
                    type: "POST",
                    url: "/"+$(element).attr("card-type-")+index,
                    data: { 
                       imgBase64: dataURL
                    }
                  }).done(function(o) {
                    console.log('saved'); 
                    // If you want the file to be visible in the browser 
                    // - please modify the callback in javascript. All you
                    // need is to return the url to the file, you just saved 
                    // and than put the image in your browser.
                  });


                $(canvas).remove();
                $(element).removeClass('scale-up');
            });
        //timer again
        if (index < elements.length) {
            index++;
            setTimeout(doNext, 100);
        }
    }
    doNext();
});