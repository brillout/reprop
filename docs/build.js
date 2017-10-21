const fs = require('fs');
const assert = require('assert');
const path_module = require('path');

(() => {

    const TEMPLATE_EXT = '.template.md';

    (() => {
        const templates = find_templates();
        templates
        .map(template => {
            get_menu_info(template);
            return template;
        })
        .forEach(template => {
            add_menu(template, templates);
            add_inline_code(template);
            replace_package_paths(template);
            add_edit_note(template);
            write_content(template);
        });
    })();

    return;

    function add_menu(template, templates) {
        const prefix = '!MENU';
        const lines = template.content.split('\n');
        const menu_line = lines.filter(is_menu_line);
        assert(menu_line.length<=1);
        if( menu_line.length===0 ) {
            return;
        }
        const menu_text = (
            templates
            .slice()
            .sort((t1, t2) => parseInt(t1.menu_order) - parseInt(t2.menu_order))
            .map(template => {
                const link = template.menu_link || template.dist_path__md_relative;
                return '['+template.menu_title+']('+link+')';
            })
            .join('<br/>\n')
        );
        template.content = (
            lines
            .map(line => {
                if( ! is_menu_line(line) ) {
                    return line;
                }
                return menu_text;
            })
            .join('\n')
        )
        function is_menu_line(line) {
            const is_hit = line===prefix;
            assert(is_hit || line.indexOf(prefix)===-1);
            return is_hit;
        }
    }

    function add_inline_code(template) {
        template.content = (
            template.content
            .split('\n')
            .map(line => {
                const prefix = '!INLINE ';
                if( ! line.startsWith(prefix) ) {
                    return [line];
                }
                const code_path = line.slice(prefix.length);
                const code_body = (
                    getFileContent(
                        path_module.resolve(
                            path_module.dirname(template.template_path),
                            code_path,
                        )
                    )
                    .replace(/\n$/,'')
                );
                const code_content = (
                    [
                        '// /'+path_module.relative('..', code_path),
                        '',
                        ...(code_body.split('\n')),
                    ]
                );
                return code_content;
            })
            .reduce(flatten)
            .join('\n')
        );
    }

    function get_menu_info(template) {
        template.menu_title = get_info('MENU_TITLE', template);
        template.menu_order = get_info('MENU_ORDER', template);
        template.menu_link = get_info('MENU_LINK', template);
    }
    function get_info(token, template) {
        const prefix = '!'+token+' ';
        const lines = template.content.split('\n');
        const token_line = lines.filter(is_token_line);
        assert(token_line.length<=1);

        template.content = (
            lines
            .filter(line => !is_token_line(line))
            .join('\n')
        );

        return (
            token_line.length===0 ? (
                null
            ) : (
                token_line[0].slice(prefix.length)
            )
        );

        return;

        function is_token_line(line) {
            const is_hit = line.startsWith(prefix);
            assert(is_hit || line.indexOf(prefix)===-1);
            return is_hit;
        }
    }

    function add_edit_note(template) {
        const EDIT_NOTE = gen_edit_note(template.source_path__md_relative);

        template.content = [
            EDIT_NOTE,
            template.content,
            EDIT_NOTE,
            '',
        ].join('\n');
    }

    function replace_package_paths(template) {
        [
            /*
            'reprop',
            'react-reprop',
            */
            {
                path_end: 'stores/Items',
                replace_with: '../stores/Items',
            },
        ].forEach(node_module => {
            const {path_end, replace_with} = (
                node_module.path_end ? (
                    node_module
                ) : (
                    {path_end: node_module, replace_with: node_module}
                )
            );
            const regex = new RegExp("require\\('.*\\/"+path_end+"'\\)", 'g');
            template.content = template.content.replace(regex, "require('"+replace_with+"')");
        });

        return template.content;
    }

    function write_content(template) {
        fs.writeFileSync(
            template.dist_path_relative,
            template.content,
        );
    }

    function getFileContent(path) {
        return fs.readFileSync(path).toString();
    }
    function flatten(arr, el) {
        return [...arr, ...el];
    }
    function gen_edit_note(src_path) {
        const padding = new Array(5).fill('\n').join('');
        return (
            [
                '<!---',
                ...(
                    new Array(5)
                    .fill([
                        padding,
                        '    WARNING, READ THIS.',
                        '    This is a computed file. Do not edit.',
                        '    Edit `'+src_path+'` instead.',
                        padding,
                    ].join('\n'))
                ),
                '-->',
            ]
            .join('\n')
        );
    }
    function find_templates() {
        return (
            fs.readdirSync(__dirname)
            .filter(filename => filename.endsWith(TEMPLATE_EXT))
            .map(template_path_relative => {
                const template_path = path_module.join(__dirname, template_path_relative)
                if( !template_path.endsWith(TEMPLATE_EXT) ) {
                    throw new Error('Should end with '+TEMPLATE_EXT);
                }
                const content = getFileContent(template_path);
                const dist_path_relative = distify(template_path);
                const dist_path__md_relative = make_path_md_absolute(distify(template_path_relative));
                const source_path__md_relative = make_path_md_absolute(template_path_relative);
                return {
                    template_path,
                    template_path_relative,
                    content,
                    dist_path_relative,
                    dist_path__md_relative,
                    source_path__md_relative,
                };

                function distify(path) {
                    return path.slice(0, -TEMPLATE_EXT.length)+'.md';
                }

                function make_path_md_absolute(path_relative) {
                    return '/'+path_module.join('docs', path_relative);
                }
            })
        );
    }
})();
