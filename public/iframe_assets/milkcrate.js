var MILKCRATE = {
    REVISION: '1',
    util: {},
    animate: {},
    mem: {}
};

MILKCRATE.util.setFlag = function(flag, value){
    MILKCRATE.mem['flags'][flag] = value;
}

MILKCRATE.util.getFlag = function(flag){
    return MILKCRATE.mem['flags'][flag];
}

MILKCRATE.util.memorize = function(obj, silo){
    if(MILKCRATE.mem[silo] == null){
        MILKCRATE.mem[silo] = {};
    }
    MILKCRATE.mem[silo][obj.id] = obj;

}

MILKCRATE.util.memorizeList = function(list, silo){
    $.each( list, function( key, value ) {
      //alert( key + ": " + value );
      MILKCRATE.util.memorize(value, silo);
    });

}

MILKCRATE.util.base64 = function(mimeType, base64) {
  return 'data:' + mimeType + ';base64,' + base64;
};

MILKCRATE.util.retrieve = function(id, silo){
    return MILKCRATE.mem[silo][parseInt(id)];
}

MILKCRATE.util.setStrLength = function(str, strLength, upperCase){
    var ellipsis = '...';
    var newStr;
    if (str && str.length > strLength){
        newStr = str.substring(0, (strLength - 3));
        if (upperCase){
           newStr = MILKCRATE.util.capitalizeFirst(newStr);
        }
        return new Handlebars.SafeString(newStr  + ellipsis);
    }
    return str;
}

MILKCRATE.util.hexToRgb = function(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

MILKCRATE.util.capitalizeFirst = function(str){
    return str.toLowerCase().replace( /\b\w/g, function (m) {
        return m.toUpperCase();
    });
};

MILKCRATE.util.get_dictionary_length = function(dict_in) {
    return Object.keys(dict_in).length;
}

MILKCRATE.util.set_window_hash = function(hash_in) {
        window.history.pushState("object or string", "sales/api/", hash_in);
    },

    MILKCRATE.util.set_window_url_end = function(text){
        history.pushState({}, "", text);
    }

    MILKCRATE.util.csrfSafeMethod = function(method) {
        // these HTTP methods do not require CSRF protection
        return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
    }

MILKCRATE.util.set_up_ajax = function() {
    MILKCRATE.util.csrftoken = MILKCRATE.util.getCookie('csrftoken');
    $.ajaxSetup({
        beforeSend: function(xhr, settings) {
            if (!MILKCRATE.util.csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", MILKCRATE.util.csrftoken);
            }
        }
    });
}

MILKCRATE.util.setCookie = function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
}

MILKCRATE.util.getCookie = function(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie != '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) == (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

MILKCRATE.util.clear_window_querystring = function() {
    MILKCRATE.util.set_window_history(MILKCRATE.util.get_window_url_no_querystring());
}

MILKCRATE.util.get_window_querystring = function() {
    return MILKCRATE.util.get_querystring(window.location.href);
}

MILKCRATE.util.get_querystring = function(url) {
    var query_index = url.indexOf("?");
    if (query_index != -1) {
        return url.substr(query_index);
    } else {
        return "";
    }
}

MILKCRATE.util.get_window_querystring_var = function(varname) {
    return MILKCRATE.util.get_querystring_var(window.location.href, varname);
}

MILKCRATE.util.get_querystring_var = function(url, varname) {
    var return_vars = null;
    var vars = [],
        hash;
    var hashes = url.slice(url.indexOf('?') + 1).split('&');
    //if these are the same there is no querystring, return blank
    if (hashes[0] != url) {
        for (var i = 0; i < hashes.length; i++) {
            hash = hashes[i].split('=');
            vars.push(hash[0]);
            vars[hash[0]] = hash[1];
        }
        //console.log("query vars:");
        //console.log(vars);
        //pull var from array
        return_vars = vars[varname];
    }
    return return_vars;
}

MILKCRATE.util.get_window_url_no_querystring = function() {
    //remove opening /
    return window.location.pathname.split('?')[0].substr(1);
}

MILKCRATE.util.get_decoded_json_querystring_var = function(var_name) {
    //console.log("get_decoded_json_querystring_var: "+var_name);
    var encoded_filters = MILKCRATE.util.get_window_querystring_var(var_name);
    if (encoded_filters == undefined) {
        //console.log("undefined filters");
        return {};
    }
    var decoded_filters = decodeURIComponent(encoded_filters);
    var dict_filters = JSON.parse(decoded_filters);
    return dict_filters;
}

MILKCRATE.util.url_encode_json = function(json_in) {
    return encodeURIComponent(JSON.stringify(json_in))
}

//Convert <br/> tags to email friendly line breaks
MILKCRATE.util.br2nl = function(str) {
    return str.replace(/<br\s*\/?>/mg, "%0D%0A");
}

MILKCRATE.util.render_jsons_to_handlebars = function(jsons, template, destination){
    //build template
    var source = template.html();
    var template = Handlebars.compile(source);
    var items = [];

    $.each( jsons, function( key, value ) {
      //alert( key + ": " + value );
        var item = template(value);

        destination.append(item);
        items.push(item);
    });

    return items;

}

MILKCRATE.util.json_to_str= function(obj){
    // implement JSON.stringify serialization
    JSON.stringify = JSON.stringify || function (obj) {
        var t = typeof (obj);
        if (t != "object" || obj === null) {
            // simple data type
            if (t == "string") obj = '"'+obj+'"';
            return String(obj);
        }
        else {
            // recurse array or object
            var n, v, json = [], arr = (obj && obj.constructor == Array);
            for (n in obj) {
                v = obj[n]; t = typeof(v);
                if (t == "string") v = '"'+v+'"';
                else if (t == "object" && v !== null) v = JSON.stringify(v);
                json.push((arr ? "" : '"' + n + '":') + String(v));
            }
            return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}");
        }
    };

    return JSON.stringify(obj);
}
MILKCRATE.animate.scroll_to_element = function(elem, offset) {
    $('html,body').animate({
        scrollTop: elem.offset().top - offset
    }, 800);
}

MILKCRATE.animate.get_current_scroll = function() {
    $('html,body').animate({
        scrollTop: elem.offset().top - offset
    }, 800);
}

MILKCRATE.animate.scroll_to_top = function() {
    $('html, body').animate({
        scrollTop: 0
    }, 800);
}

MILKCRATE.get_jquery = function() {
    return $;
}


