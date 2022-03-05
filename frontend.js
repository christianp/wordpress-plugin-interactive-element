(function() {
    const clp_interactive_element = window.clp_interactive_element;
    const {settings} = clp_interactive_element;
    const scripts_loaded = {};
    const script_inits = {};

    clp_interactive_element.register_interactive_element = function(item, init) {
        script_inits[item] = init;
    }

    function load_script(item) {
        if(scripts_loaded[item]) {
            return scripts_loaded[item];
        }
        const script = document.createElement('script');
        const item_url = `${settings.wp_content_url}/interactive-elements/${item}/`;
        const promise = new Promise((resolve,reject) => {
            script.onload = e => {
                resolve({
                    item_url: item_url
                });
            }
        });
        scripts_loaded[item] = promise;
        script.setAttribute('src', `${item_url}element.js`);
        document.head.appendChild(script);
        return promise;
    }

class InteractiveElement extends HTMLElement {
    constructor() {
        super();
        this.shadow = this.attachShadow({mode: 'open'});
    }
    connectedCallback() {
        const item = this.getAttribute('data-item');
        const params = this.getAttribute('data-params');
        const container = document.createElement('div');
        this.shadow.appendChild(container);
        load_script(item).then(data => {
            script_inits[item](container, params, data);
        });
    }
}

customElements.define('interactive-element', InteractiveElement);
})();
