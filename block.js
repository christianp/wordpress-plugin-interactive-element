( function ( wp ) {
    const el = wp.element.createElement;
    const {SelectControl, TextareaControl} = wp.components;
 
    wp.blocks.registerBlockType( 'christianp/interactive-element', {
        attributes: {
            item: {
                type: 'string',
                source: 'attribute',
                selector: 'interactive-element',
                attribute: 'data-item',
            },
            params: {
                type: 'string',
                source: 'text',
                selector: 'interactive-element'
            },
        },
        edit: function(props) {
            const blockProps = wp.blockEditor.useBlockProps();
            const available_elements = clp_interactive_element.elements;
            return el( 'div', blockProps, 
                [
                    el(
                        SelectControl,
                        {
                            label: 'Select an element',
                            name: 'item',
                            value: props.attributes.item,
                            onChange: selection => props.setAttributes({ item: selection }),
                            options: 
                                [{value:'',label:''}].concat(
                                    Object.entries(available_elements).map(([item,info]) => {
                                        return { value: item, label: info.name };
                                    })
                                )
                        }
                    ),
                    el(
                        TextareaControl,
                        {
                            label: 'Parameters',
                            value: props.attributes.params,
                            name: 'params',
                            onChange: params => props.setAttributes({ params: params }),
                        }
                    )
                ]
            );
        },
        save: function(props) {
            const blockProps = wp.blockEditor.useBlockProps.save();
            return el( 'figure', blockProps,
                el(
                    'interactive-element', 
                    {
                        'data-item': props.attributes.item,
                        'data-params': props.attributes.params
                    }
                )
            );
        },
    } );
} )( window.wp );
