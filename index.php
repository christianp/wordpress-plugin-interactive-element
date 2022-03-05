<?php
/**
 * Plugin Name: Interactive element block
 */

class InteractiveElement {
    public static $default_options = [
        'scripts_fs' => 'arg',
        'scripts_url' => '/interactive-elements',
    ];

    public static function load_options() {
        $options = array_merge(self::$default_options, []);

        $set_options = get_option('interactive_element_options');
        if(is_array($set_options)) {
            foreach($set_options as $key => $value) {
                if(array_key_exists($key,$options)) {
                    $options[$key] = $value;
                }
            }
        }

        return $options;
    }

    public static function register_block() {
        register_block_type( __DIR__ );
    }

    public static function enqueue_script() {   
        wp_enqueue_script( 'interactive_element', plugin_dir_url( __FILE__ ) . 'frontend.js' );
    }

    public static function js_settings() {
        $options = self::load_options();
        $options['wp_content_url'] = content_url();
?><script>
    window.clp_interactive_element = {
        settings: <?= json_encode($options) ?>,
        elements: <?= json_encode(InteractiveElement::get_interactive_elements()) ?>
    };
</script>
<?php
    }

    public static function create_menu() {
        $interactive_element_page = add_options_page(
            'Interactive Element options',  // Name of page
            'Interactive Element',           // Label in menu
            'manage_options',           // Capability required
            'interactive_element_options',  // Menu slug, used to uniquely identify the page
            'InteractiveElement::options_page'    // Function that renders the options page
        );

        if ( ! $interactive_element_page )
            return;

        //call register settings function
        add_action( 'admin_init', 'InteractiveElement::register_settings' );
    }

    public static function options_page() {
?>
  <div>
  <h1>Interactive Element options</h1>
  <form method="post" action="options.php">
    <?php settings_fields( 'interactive_element_options' ); ?>
    <?php do_settings_sections('interactive_element'); ?>

    <button type="submit"><?php _e('Save Changes'); ?></button>
  </form>
  </div>
<?php }

    public static function register_settings() {
        register_setting(
          'interactive_element_options', 
          'interactive_element_options', 
          array(
            'sanitize_callback' => 'InteractiveElement::options_validate'
          )
        );
        add_settings_section(
            'interactive_element_main', 
            'Main Settings', 
            'InteractiveElement::main_text', 
            'interactive_element'
        );

        add_settings_field(
            'scripts_fs',
            'Location of scripts on the server\'s file system',
            'InteractiveElement::scripts_fs_input',
            'interactive_element',
            'interactive_element_main',
            array(
                'label_for' => 'scripts_fs'
            )
        );
        add_settings_field(
            'scripts_url',
            'URL of scripts',
            'InteractiveElement::scripts_url_input',
            'interactive_element',
            'interactive_element_main',
            array(
                'label_for' => 'scripts_url'
            )
        );
    }

    public static function main_text() {
    }
    public static function config_text() {
    }
    public static function scripts_fs_input() {
        InteractiveElement::input("scripts_fs");
    }
    public static function scripts_url_input() {
        InteractiveElement::input("scripts_url");
    }

    public static function input($key) {
        $options = self::load_options();
        echo $key;
        echo json_encode($options);
    ?>
        <input type="text" name="interactive_element_options[<?= $key ?>]" value="<?= $options[$key] ?>">
    <?php
    }

    public static function options_validate($options) {
        $cleaned = array();
        foreach(self::$default_options as $key => $value) {
            $cleaned[$key] = $options[$key];
        }
        return $cleaned;
    }

    public static function get_interactive_elements() {
        $elements = [];
        $elements_dir = WP_CONTENT_DIR . '/interactive-elements';
        foreach(scandir($elements_dir) as $name) {
            $dir = "{$elements_dir}/{$name}";
            if(!is_dir($dir) || str_starts_with($name,'.')) {
                continue;
            }
            $info = json_decode(file_get_contents("${dir}/info.json"));
            $elements[$name] = $info;
        }
        return $elements;
    }

}
add_action( 'init', 'InteractiveElement::register_block' );

add_action('wp_enqueue_scripts', 'InteractiveElement::enqueue_script');

add_action('wp_head','InteractiveElement::js_settings',1);
add_action('admin_head','InteractiveElement::js_settings',1);

add_action('admin_menu', 'InteractiveElement::create_menu');
