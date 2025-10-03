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
        const item_url = `${settings.wp_content_url}/interactive-elements/${item}`;
        const promise = fetch(`${item_url}/info.json`).then(r => r.json()).then(json => {
            let promise = Promise.resolve(Object.assign({item_url}, json));
            if(json.template) {
                promise = promise.then(out => {
                    return fetch(`${item_url}/${json.template}`).then(r => r.text()).then(text => { out.template = text; return out; });
                });
            }
            if(json.script) {
                promise = promise.then(out => {
                    const script = document.createElement('script');
                    script.setAttribute('type','module');
                    script.setAttribute('src', `${item_url}/${json.script}`);
                    const {promise, resolve} = Promise.withResolvers();
                    const sc = Promise.withResolvers();
                    script.onload = () => {
                        sc.resolve(out);
                    }
                    document.head.appendChild(script);
                    return sc.promise;
                });
            }
            return promise;
        });
        return promise;
    }

class InteractiveElement extends HTMLElement {
    constructor() {
        super();
    }
    connectedCallback() {
        if(document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }
    init() {
        const item = this.getAttribute('data-item');
        const params = this.querySelector('script[type="params"]').textContent;
        this.shadow = this.attachShadow({mode: 'open'});
        const container = document.createElement('div');
        this.shadow.appendChild(container);
        load_script(item).then(data => {
            if(data.template) {
                container.innerHTML = data.template;
            }
            if(data.css) {
                const link = document.createElement('link');
                link.setAttribute('rel','stylesheet');
                link.setAttribute('href',`${data.item_url}/${data.css}`);
                container.append(link);
            }
            script_inits[item](container, params, data);
        });
    }
}

customElements.define('interactive-element', InteractiveElement);
})();
