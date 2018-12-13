(function createSnackBar(){
	  snackBar = document.createElement('input')
	  snackBar.style.cssText = 
        'visibility: hidden;min-width: 250px;margin-left: -125px;background-color: #333;color: #fff;text-align: center;border-radius: 2px;padding: 16px;position: fixed;z-index: 1;left: 50%;bottom: 30px;font-size: 17px;'
	  snackBar.innerHTML = 'Some text some message..!'
    snackBar.setAttribute("id", `snackbar`)

	  document.body.appendChild(snackBar)
})();

const snackbar = document.getElementById("snackbar")


/* Keyboard */
const Keyboard = Object.freeze({
    final: Object.freeze({
        bind_proto: Object.freeze({
            key: null,
            ctrlKey: false,
            altKey: false,
            desc: null,
            callback: null,
        })
    }),

    private: Object.seal({
        el: null,
        bindings: null,
        ev_keydown_ptr: null
    }),

    public: Object.seal({
    	/* (nothing here yet) */
    }),
    _mkbind: function(bind){
        let self = this;

        // console.log(self.final.bind_proto)
        // console.log('bind_proto^')
        // console.log('bind:')
        // console.log(bind)
        // console.log(Object.seal({...self.final.bind_proto, ...bind}))
        // console.log("Object.seal^")
        return Object.seal({...self.final.bind_proto, ...bind});
	},
    _binding_filter: function(search){
        // console.log(search)
        // console.log('search^')
    	return bind => (
            bind.altKey  === search.altKey &&
            bind.ctrlKey === search.ctrlKey &&
            bind.key     === search.key
        );
    },
    _binding_lookup: function(bind){
        let self = this;
        // console.log(self.private.bindings)
        // console.log('bindings^:')
        // console.log('bind:')
        // console.log(bind)
    	let result = self.private.bindings.find(self._binding_filter(bind));
        if(typeof result === "undefined")
            return null;

        console.log('result:')
        console.log(result)
        return result;
    },
    _ev_keydown: function(){
        let self = this;

        return function(ev){
            let result = self._binding_lookup(ev);
            // this is triggered on EACH keydown
            // By now, we already have all bindings registered
            // Looks like when a key is pressed,
            // it would look from our binding_list if the key pressed
            // matches what we have on the bindings[] list

            // console.log("TRIGGERED")
            console.log(ev)
            console.log('ev^')
            // console.log('result:')
            // console.log(JSON.stringify(self))
            // console.log(result);

            if(result === null)
                return;

            ev.preventDefault();
            result.callback(ev);
        }
    },
    _get_label: function(binding){
        let ret = binding.key;
        if("ABCDEFGHIJKLMNOPQRSTUVWXYZ".indexOf(binding.key) !== -1)
            ret = "shift-" + ret;
        if(binding.ctrlKey)
            ret = "ctrl-" + ret;
        if(binding.altKey)
            ret = "alt-" + ret;
        // console.log('ret:' + ret)
        return ret;
    },
    _pad_left: function(text, width){
        while(text.length < width)
            text = " " + text;
        return text;
    },
    attach: function(el){
        let self = this;
    	  self.private.ev_keydown_ptr = self._ev_keydown();
        self.private.el = el;
        self.private.el.tabIndex = 0;
        self.private.el.addEventListener("keydown", self.private.ev_keydown_ptr);
        self.private.bindings = [];
    },
    detach: function(){
        let self = this;
        if(self.private.el === null)
            return;
        self.private.el.removeEventListener("keydown", self.private.ev_keydown_ptr);
    },
    add_binding: function(bind){
    	let self = this;
      let bind_proper = self._mkbind(bind);
    	let result = self._binding_lookup(bind_proper);
        if(result !== null)
            return false;
        // console.log('bindings:')
        self.private.bindings.push(bind_proper);
        // console.log(self.private.bindings)

        return true;
    },
    remove_binding: function(bind){
        let self = this;
        let bind_proper = self._mkbind(bind);
    	let result = self._binding_lookup(bind_proper);
        let index = self.private.bindings.indexOf(result);

            return false;

        self.private.bindings.splice(index, 1);
        return true;
    },
    list_bindings: function(){
        let self = this;
        let out = "";
        let labels = self.private.bindings.map(self._get_label);
        let longest = labels.map(l => l.length).reduce((a,b) => a>b?a:b, 0);
        labels.map(label => self._pad_left(label, longest)).forEach(function(label, i){
            out += `${label}  ${self.private.bindings[i].desc}\n`;
        });
        return out;
    }
});

let inputbox = document.querySelector(".input");
let outputbox = document.querySelector(".output");

function log(msg){
    outputbox.innerHTML = msg;
}

Keyboard.attach(document.body);

// Here's where the magic is...

Keyboard.add_binding({
    key: "q",
    desc: "Notify '^q'",
    ctrlKey: true,
    callback: function(ev){
        snackbar.value = ``
        snackbar.style.visibility = `hidden`
    }
});
Keyboard.add_binding({
    key: "a",
    ctrlKey: true,
    desc: "Notify '^a'",
    callback: function(ev){
        snackbar.style.visibility = 'visible'
        snackbar.focus()
    }
});
Keyboard.add_binding({
    key: "Enter",
    desc: "Press Enter",
    callback: function(ev){
        // what to do on enter?
        // check if I am inside the input
        // if I am, and if input has content
        // submit
        snackbar.value = ''
        snackbar.style.visibility = 'hidden'
        console.log("ENTER")
    }
})
Keyboard.add_binding({
    key: "?",
    desc: "Print this help.",
    callback: function(ev){
        log(Keyboard.list_bindings().replace(/\n/g, "<br>"));
    }
});

/*
 * Try adding a binding for Ctrl-L, or calling
 * Keyboard.remove_binding() on ctrl-d. Notice how when a
 * binding is found, it is executed and the browser's
 * default (e.g. opening the bookmark UI) is prevented.
 * But it nothing is found, it's business as usual.
 *
 * I've provided said line below. Un-comment it to experiment.
 */

// Keyboard.remove_binding({key: "d", ctrlKey: true});
