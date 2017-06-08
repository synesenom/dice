# This is pretty lame to make documentation generator in python, but jsDOC cannot handle
# the UMD structure and I found it very difficult to apply to my case...
# FIXME use JSDOC instead
import re
import json


TAGS = {
    'param': 'param',
    'returns': 'returns',
    'memberOf': 'memberOf',
    'private': 'private',
    'namespace': 'namespace',
    'method': 'method',
    'module': 'module'
}


class DocBlock:
    def __init__(self, fp):
        self._content = {"desc": ""}
        self._status = None
        if not self.read(fp):
            self._content = None

    @staticmethod
    def _has_tag(text, tag):
        return text.startswith("@" + tag)

    @staticmethod
    def _get_flag(text, flag):
        return DocBlock._has_tag(text, TAGS[flag])

    @staticmethod
    def _get_label(text, label):
        if DocBlock._has_tag(text, TAGS[label]):
            return re.findall(r"@" + label + r" (.*)", text)[0]

    @staticmethod
    def _get_value(text, value):
        if DocBlock._has_tag(text, TAGS[value]):
            return re.findall(r"@" + value + " \{(.*)\}", text)[0].strip('()').split('|')

    @staticmethod
    def _get_returns(text):
        if DocBlock._has_tag(text, TAGS['returns']):
            return {
                'type': re.findall(r"@returns \{(.*)\} .*", text)[0].strip('()').split('|'),
                'desc': re.findall(r"@returns \{.*\} (.*)", text)[0] + " "
            }

    @staticmethod
    def _get_param(text):
        if DocBlock._has_tag(text, TAGS['param']):
            # type
            p = {
                'type': re.findall(r"@param \{(.*)\} .* .*", text)[0].split('|')
            }

            # optional
            if '=' in p['type'][-1]:
                p['type'][-1] = p['type'][-1].strip('=')
                p['optional'] = True
            else:
                p['optional'] = False

            # parameter name
            p['name'] = re.findall("@param \{.*\} (.*?) .*", text)[0]

            # description
            p['desc'] = re.findall("@param \{.*\} .*? (.*)", text)[0] + " "

            return p

    @staticmethod
    def _get_private(text):
        return DocBlock._has_tag(text, TAGS['private'])

    @staticmethod
    def _clean(text):
        return re.sub(r"\s+", r" ", text).strip()

    def status(self):
        return self._status

    def get(self, tag=None):
        # no tag given
        if tag is None:
            return self._content

        # tag is given
        if tag in self._content:
            return self._content[tag]
        else:
            return None

    def read(self, fp):
        while True:
            line = fp.readline()
            if line == "":
                return False
            line = line.strip()

            # next block found
            if line == "/**":
                self._status = 'desc'
                continue

            # block end found
            if line == "*/":
                # finalize content
                self._content['desc'] = DocBlock._clean(self._content['desc'])
                if 'returns' in self._content:
                    self._content['returns']['desc'] = DocBlock._clean(self._content['returns']['desc'])
                if 'param' in self._content:
                    for i in range(len(self._content['param'])):
                        self._content['param'][i]['desc'] = DocBlock._clean(self._content['param'][i]['desc'])

                # check for missing
                if 'name' not in self._content:
                    print("Error: missing @name")
                    exit(-1)
                if 'module' not in self._content and 'memberOf' not in self._content:
                    print("Error: missing @memberOf")
                    exit(-2)
                if 'type' not in self._content:
                    print("Error: missing @type")
                    exit(-3)
                return True

            if self._status is not None:
                line = line.strip("* ")
                # flags
                for flag in ['private']:
                    if DocBlock._get_flag(line, flag):
                        self._content[flag] = DocBlock._get_flag(line, flag)
                        self._status = flag
                        continue

                # labels
                for label in ['module', 'namespace', 'method', 'memberOf']:
                    if DocBlock._get_label(line, label):
                        self._content[label] = DocBlock._get_label(line, label)
                        if label in ['module', 'namespace', 'method']:
                            self._content['name'] = self._content[label]
                            self._content['type'] = label
                        self._status = label
                        continue

                # returns
                if DocBlock._get_returns(line):
                    self._content['returns'] = DocBlock._get_returns(line)
                    self._status = 'returns'
                    continue

                # param
                if DocBlock._get_param(line):
                    if 'param' not in self._content:
                        self._content['param'] = []
                    self._content['param'].append(DocBlock._get_param(line))
                    self._status = 'param'
                    continue

                # normal line
                if self._status == 'desc':
                    self._content['desc'] += line + " "
                elif self._status == 'returns':
                    self._content['returns']['desc'] += line + " "
                elif self._status == 'param':
                    self._content['param'][-1] += line + " "


class Documentation:
    def __init__(self, filename):
        self._doc = []
        self.build(filename)

    def build(self, filename):
        with open(filename, 'r') as f:
            while True:
                # read block
                block = DocBlock(f)

                # if block is empty, return
                if block.status() is None:
                    break

                # add block
                if block.get('private') is None:
                    self._doc.append(block.get())

    def json(self, filename):
        with open(filename, 'w') as f:
            json.dump(self._doc, f, indent=2)

    def html(self, filename, template):
        def menu_entry(o):
            if obj['type'] == 'namespace':
                return "<input type='checkbox' id='s2-%s-%s'><label for='s2-%s-%s'>%s</label>\n"\
                       % (o['memberOf'].replace('.', '-'), o['name'], o['memberOf'].replace('.', '-'), o['name'], o['name'])
            return ""

        def title(o):
            if o['type'] == 'namespace':
                return "<h2 id='api-%s-%s'>%s</h2>\n" % (o['memberOf'].replace('.', '-'), o['name'], o['name'])
            if o['type'] == 'method':
                return "<h3 id='api-%s-%s'>%s</h3>\n" % (o['memberOf'].replace('.', '-'), o['name'], o['name'])
            return ""

        def desc(o):
            return o['desc'] + "\n"

        def func(o):
            html = "<pre>" + o['memberOf'] + "." + o['name'] + "("
            opts = 0
            if 'param' in o:
                if o['param'][0]['optional']:
                    opts += 1
                    html += "["
                html += o['param'][0]['name']
                for p in o['param'][1:]:
                    if p['optional']:
                        opts += 1
                        html += "["
                    html += ", " + p['name']
            html += "".join(["]" for _ in range(opts)])
            html += ")</pre>\n"
            return html

        def args(o):
            html = "<table>"
            html += "<thead><tr>" \
                    "<th class='fifth'>argument</th>" \
                    "<th>description</th>" \
                    "</tr></thead>"
            for p in o['param']:
                html += "<tr><td>%s</td><td>%s</td></tr>" % (p['name'], p['desc'])
            html += "</table>"
            return html

        def returns(o):
            html = "<table>"
            html += "<thead><tr>" \
                    "<th class='fifth'>returns</th>" \
                    "<th>description</th>" \
                    "</tr></thead>"
            html += "<tr><td>%s</td><td>%s</td></tr>" \
                    % (", ".join("<code>%s</code>" % x for x in o['returns']['type']), o['returns']['desc'])
            html += "</table>"
            return html

        menu = ""
        namespaces = {}
        tag = ""
        for obj in self._doc:
            if obj['type'] == 'module':
                tag = obj['name']
            if obj['type'] == 'namespace':
                namespaces[tag + "." + obj['name']] = {'obj': obj, 'members': [], 'i': len(namespaces)}
            if obj['type'] == 'method':
                namespaces[obj['memberOf']]['members'].append(obj)
        for n in sorted([x for x in namespaces.values()], key=lambda x: x['i']):
            menu += "<input type='checkbox' id='s2-%s-%s'><label for='s2-%s-%s'>%s</label>"\
                    % (n['obj']['memberOf'].replace('.', '-'), n['obj']['name'],
                       n['obj']['memberOf'].replace('.', '-'), n['obj']['name'],
                       n['obj']['name'])
            menu += "<div class='s2'>"
            for m in n['members']:
                menu += "<a href='#api-%s-%s'>%s</a>" % (m['memberOf'].replace('.', '-'), m['name'], m['name'])
            menu += "</div>"

        content = ""
        for obj in self._doc:
            content += title(obj)
            if obj['type'] == 'method':
                content += "<div class='card'>" + func(obj) + "<br>"
            if obj['type'] in ['namespace', 'method']:
                content += desc(obj)
            if 'param' in obj:
                content += args(obj)
            if 'returns' in obj:
                content += returns(obj)
            if obj['type'] == 'method':
                content += "</div>"

        # add to template
        with open(filename, 'w') as f:
            with open(template, 'r') as temp:
                f.write(temp.read()
                        .replace('{{API_CONTENT}}', content)
                        .replace('{{API_MENU}}', menu)
                        )

Documentation('src/dice.js').html("index.html", template="docs/template.html")
