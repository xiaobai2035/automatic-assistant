import Vue from "vue";
import {
    Drawer,
    Dialog,
    Autocomplete,
    Input,
    InputNumber,
    Checkbox,
    CheckboxButton,
    CheckboxGroup,
    Switch,
    Select,
    Option,
    OptionGroup,
    Button,
    ButtonGroup,
    Table,
    TableColumn,
    DatePicker,
    TimeSelect,
    TimePicker,
    Popover,
    Tooltip,
    Form,
    FormItem,
    Tabs,
    TabPane,
    Tag,
    Slider,
    Icon,
    Row,
    Col,
    Card,
    Collapse,
    CollapseItem,
    Timeline,
    TimelineItem,
    Link,
    Divider,
    MessageBox,
    Message,
    Empty,
    Popconfirm,
    Dropdown,
    DropdownMenu,
    DropdownItem,
    Result,
    Alert
  } from 'element-ui';
  
  Vue.use(Alert);
  Vue.use(Empty);
  Vue.use(Popconfirm);
  Vue.use(Dropdown);
  Vue.use(DropdownMenu);
  Vue.use(DropdownItem);
  Vue.use(Result);
  Vue.use(Drawer);
  Vue.use(Dialog);
  Vue.use(Autocomplete);
  Vue.use(Input);
  Vue.use(InputNumber);
  Vue.use(Checkbox);
  Vue.use(CheckboxButton);
  Vue.use(CheckboxGroup);
  Vue.use(Switch);
  Vue.use(Select);
  Vue.use(Option);
  Vue.use(OptionGroup);
  Vue.use(Button);
  Vue.use(ButtonGroup);
  Vue.use(Table);
  Vue.use(TableColumn);
  Vue.use(DatePicker);
  Vue.use(TimeSelect);
  Vue.use(TimePicker);
  Vue.use(Popover);
  Vue.use(Tooltip);
  Vue.use(Form);
  Vue.use(FormItem);
  Vue.use(Tabs);
  Vue.use(TabPane);
  Vue.use(Tag);
  Vue.use(Slider);
  Vue.use(Icon);
  Vue.use(Row);
  Vue.use(Col);
  Vue.use(Card);
  Vue.use(Collapse);
  Vue.use(CollapseItem);
  Vue.use(Timeline);
  Vue.use(TimelineItem);
  Vue.use(Link);
  Vue.use(Divider);
  
  import lang from 'element-ui/lib/locale/lang/en'
  import locale from 'element-ui/lib/locale'

  locale.use(lang)

  Vue.prototype.$alert = MessageBox.alert;
  Vue.prototype.$confirm = MessageBox.confirm;
  Vue.prototype.$prompt = MessageBox.prompt;
  Vue.prototype.$message = Message;