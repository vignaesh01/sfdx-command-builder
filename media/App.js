var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

//import Button from '@material-ui/core/Button';
//var Button = require("@material-ui/core/Button");
var vscode = acquireVsCodeApi();

var _MaterialUI = MaterialUI,
    Button = _MaterialUI.Button,
    Grid = _MaterialUI.Grid,
    Paper = _MaterialUI.Paper,
    TextField = _MaterialUI.TextField,
    List = _MaterialUI.List,
    ListItem = _MaterialUI.ListItem,
    ListItemText = _MaterialUI.ListItemText,
    Typography = _MaterialUI.Typography,
    Table = _MaterialUI.Table,
    TableBody = _MaterialUI.TableBody,
    TableCell = _MaterialUI.TableCell,
    TableContainer = _MaterialUI.TableContainer,
    TableHead = _MaterialUI.TableHead,
    TableRow = _MaterialUI.TableRow,
    FormControlLabel = _MaterialUI.FormControlLabel,
    Switch = _MaterialUI.Switch,
    Icon = _MaterialUI.Icon,
    styles = _MaterialUI.styles,
    AppBar = _MaterialUI.AppBar,
    Toolbar = _MaterialUI.Toolbar,
    IconButton = _MaterialUI.IconButton,
    makeStyles = _MaterialUI.makeStyles,
    fade = _MaterialUI.fade,
    Card = _MaterialUI.Card,
    CardActionArea = _MaterialUI.CardActionArea,
    CardContent = _MaterialUI.CardContent,
    CardActions = _MaterialUI.CardActions,
    InputBase = _MaterialUI.InputBase,
    ThemeProvider = _MaterialUI.ThemeProvider,
    useTheme = _MaterialUI.useTheme,
    createMuiTheme = _MaterialUI.createMuiTheme,
    useMediaQuery = _MaterialUI.useMediaQuery;


var useStyles = makeStyles(function (theme) {
  return {
    root: {
      flexGrow: 1
    },
    menuButton: {
      marginRight: theme.spacing(2)
    },
    title: {
      flexGrow: 1
    },
    search: _defineProperty({
      position: 'relative',
      borderRadius: theme.shape.borderRadius,
      backgroundColor: fade(theme.palette.common.white, 0.15),
      '&:hover': {
        backgroundColor: fade(theme.palette.common.white, 0.25)
      },
      marginRight: theme.spacing(2),
      marginLeft: 0,
      width: '100%'
    }, theme.breakpoints.up('sm'), {
      marginLeft: theme.spacing(3),
      width: 'auto'
    }),
    searchIcon: {
      width: theme.spacing(7),
      height: '100%',
      position: 'absolute',
      pointerEvents: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    inputRoot: {
      color: 'inherit'
    },
    inputInput: _defineProperty({
      padding: theme.spacing(1, 1, 1, 7),
      transition: theme.transitions.create('width'),
      width: '100%'
    }, theme.breakpoints.up('md'), {
      width: 200
    })

  };
});

var App = function (_React$Component) {
  _inherits(App, _React$Component);

  function App(props) {
    _classCallCheck(this, App);

    var _this = _possibleConstructorReturn(this, (App.__proto__ || Object.getPrototypeOf(App)).call(this, props));

    _this.state = {
      commands: [],
      selectedCommand: null
    };

    _this.fetchAllCommands();

    window.addEventListener('message', function (event) {
      var message = event.data; // The json data that the extension sent
      console.log(event.data);
      switch (message.command) {
        case 'onFetchAllCommands':
          var commandsArr = message.results;
          console.log("Inside App event listener " + commandsArr.length);
          _this.setState({ commands: commandsArr });
          break;

      }
    });

    //Event this bindings
    _this.handleCommandSelect = _this.handleCommandSelect.bind(_this);
    _this.handleGoToHome = _this.handleGoToHome.bind(_this);
    return _this;
  }

  _createClass(App, [{
    key: 'render',
    value: function render() {

      var searchCommand = void 0;
      if (this.state.commands && this.state.commands.length > 0 && !this.state.selectedCommand) {
        searchCommand = React.createElement(SearchCommand, { commands: this.state.commands, onCommandSelect: this.handleCommandSelect });
      }

      var commandBuilder = void 0;
      if (this.state.selectedCommand) {
        commandBuilder = React.createElement(CommandBuilder, { selectedCommand: this.state.selectedCommand,
          onGoToHome: this.handleGoToHome });
      }

      return React.createElement(
        Grid,
        { container: true },
        React.createElement(
          Grid,
          { item: true, xs: 12 },
          searchCommand
        ),
        React.createElement(
          Grid,
          { item: true, xs: 12 },
          commandBuilder
        )
      );
    }
  }, {
    key: 'fetchAllCommands',
    value: function fetchAllCommands() {
      vscode.postMessage({
        command: 'fetchAllCommands'
      });
    }
  }, {
    key: 'handleCommandSelect',
    value: function handleCommandSelect(command) {
      this.setState({ selectedCommand: command });
    }
  }, {
    key: 'handleGoToHome',
    value: function handleGoToHome() {
      this.setState({ selectedCommand: null });
    }
  }]);

  return App;
}(React.Component);

var SearchCommand = function (_React$Component2) {
  _inherits(SearchCommand, _React$Component2);

  function SearchCommand(props) {
    _classCallCheck(this, SearchCommand);

    var _this2 = _possibleConstructorReturn(this, (SearchCommand.__proto__ || Object.getPrototypeOf(SearchCommand)).call(this, props));

    console.log("Inside SearchCommand constructor");
    _this2.commands = _this2.props.commands || [];
    console.log("this.commands");
    console.log(_this2.commands);
    //this.finalCommands=this.getFinalCommands();
    _this2.finalCommands = _this2.commands;
    _this2.state = {
      filteredCommands: _this2.finalCommands
    };

    _this2.handleChange = _this2.handleChange.bind(_this2);
    return _this2;
  }

  _createClass(SearchCommand, [{
    key: 'handleChange',
    value: function handleChange(value) {
      var filteredArr = this.getFilteredCommands(value);
      this.setState({ filteredCommands: filteredArr });
    }

    /*getFinalCommands(){
      let finalCommandsArr = this.commands.filter(command=>{
        return !(command.mainTopic || command.hidden);
        });
        return finalCommandsArr;
    }*/

  }, {
    key: 'getFilteredCommands',
    value: function getFilteredCommands(filterKey) {

      console.log("filterKey " + filterKey);
      var filteredArr = this.finalCommands.filter(function (command) {

        var flag = false;

        if (command && command.id && command.id != "" && command.id.toUpperCase().includes(filterKey.toUpperCase())) {
          flag |= true;
        }

        if (command && command.description && command.description != "" && command.description.toUpperCase().includes(filterKey.toUpperCase())) {
          flag |= true;
        }

        return flag;
      });

      return filteredArr;
    }
  }, {
    key: 'handleCommandClick',
    value: function handleCommandClick(command) {
      this.props.onCommandSelect(command);
    }
  }, {
    key: 'render',
    value: function render() {
      var _this3 = this;

      //this.setState({filteredCommands :this.commands});
      console.log("Inside SearchCommand render()");

      var filteredArr = this.state.filteredCommands.map(function (command) {

        return React.createElement(
          ListItem,
          { button: true, key: command.id, divider: true, alignItems: 'flex-start',
            onClick: _this3.handleCommandClick.bind(_this3, command) },
          React.createElement(ListItemText, { primary: command.id,
            secondary: command.description })
        );
      });

      console.log("this.state.filteredCommands");
      console.log(this.state.filteredCommands);
      console.log(filteredArr);

      return React.createElement(
        'div',
        null,
        React.createElement(HomeAppBar, { onFilterChange: this.handleChange }),
        React.createElement(
          Grid,
          { container: true, spacing: 2, justify: 'center', alignItems: 'center' },
          React.createElement(
            Grid,
            { item: true, xs: 12 },
            React.createElement(
              Paper,
              { square: true },
              React.createElement(
                List,
                { component: 'nav' },
                filteredArr
              )
            )
          )
        )
      );
    }
  }]);

  return SearchCommand;
}(React.Component);

/**
 * Builds the UI for Command Builder
 */


var CommandBuilder = function (_React$Component3) {
  _inherits(CommandBuilder, _React$Component3);

  function CommandBuilder(props) {
    _classCallCheck(this, CommandBuilder);

    var _this4 = _possibleConstructorReturn(this, (CommandBuilder.__proto__ || Object.getPrototypeOf(CommandBuilder)).call(this, props));

    console.log('Inside CommandBuilder constructor');
    _this4.state = { selCommand: _this4.props.selectedCommand,
      generatedCmd: _this4.generateCommand()
    };

    window.addEventListener('message', function (event) {
      var message = event.data; // The json data that the extension sent
      console.log(event.data);
      switch (message.command) {
        case 'onFileSelected':
          var flag = message.results;
          console.log("Inside onFileSelected listener " + flag.value);
          var selCommand = _this4.props.selectedCommand;
          var fileFlags = Object.values(selCommand.flags).filter(function (flg) {
            return flg.name == flag.name;
          });

          console.log("fileFlags " + JSON.stringify(fileFlags));
          if (fileFlags && fileFlags.length > 0) {
            fileFlags[0].value = '"' + flag.value + '"';
          }
          console.log("fileFlags after " + JSON.stringify(fileFlags));

          _this4.setState({ generatedCmd: _this4.generateCommand() });
          break;

      }
    });

    _this4.handleBackNav = _this4.handleBackNav.bind(_this4);

    return _this4;
  }

  _createClass(CommandBuilder, [{
    key: 'render',
    value: function render() {
      var _this5 = this;

      return React.createElement(
        'div',
        null,
        React.createElement(CommandAppBar, { selectedCommand: this.state.selCommand,
          onHandleBackNav: this.handleBackNav }),
        React.createElement(
          Grid,
          { container: true, spacing: 2 },
          React.createElement(
            Grid,
            { item: true, xs: 12 },
            React.createElement(
              Paper,
              { square: true, style: { padding: 5 } },
              React.createElement('br', null),
              React.createElement(
                Typography,
                { variant: 'body2', gutterBottom: true },
                this.state.selCommand.description
              ),
              React.createElement('br', null),
              React.createElement(
                Card,
                { raised: true },
                React.createElement(
                  CardActionArea,
                  null,
                  React.createElement(
                    CardContent,
                    null,
                    React.createElement(
                      Typography,
                      { gutterBottom: true, variant: 'h6', component: 'h2' },
                      'Generated Command'
                    ),
                    React.createElement(
                      Typography,
                      { variant: 'subtitle1', component: 'p' },
                      this.state.generatedCmd
                    )
                  )
                ),
                React.createElement(
                  CardActions,
                  null,
                  React.createElement(
                    Button,
                    {
                      variant: 'contained',
                      color: 'primary',
                      startIcon: React.createElement(
                        Icon,
                        null,
                        'send'
                      ),
                      onClick: this.executeCommand.bind(this)
                    },
                    'Execute'
                  ),
                  React.createElement(
                    Button,
                    {
                      variant: 'contained',
                      startIcon: React.createElement(
                        Icon,
                        null,
                        'file_copy'
                      ),
                      onClick: this.copyToClipboard.bind(this)
                    },
                    'Copy'
                  )
                )
              ),
              React.createElement('br', null),
              React.createElement(
                Table,
                null,
                React.createElement(
                  TableHead,
                  null,
                  React.createElement(
                    TableRow,
                    null,
                    React.createElement(
                      TableCell,
                      null,
                      'Enter the Flag values'
                    ),
                    React.createElement(
                      TableCell,
                      null,
                      'Description'
                    )
                  )
                ),
                React.createElement(
                  TableBody,
                  null,
                  /*this.state.selCommand.flags.map(flag => (
                   <TableRow key={flag.name}>
                     <TableCell component="th" scope="row">
                       
                       {this.getFlagControl(flag)}
                   
                     </TableCell>
                     <TableCell>{flag.description}</TableCell>
                   </TableRow>
                  ))*/
                  Object.values(this.state.selCommand.flags).map(function (flag) {
                    return React.createElement(
                      TableRow,
                      { key: flag.name },
                      React.createElement(
                        TableCell,
                        { component: 'th', scope: 'row' },
                        _this5.getFlagControl(flag)
                      ),
                      React.createElement(
                        TableCell,
                        null,
                        flag.description
                      )
                    );
                  })
                )
              )
            )
          )
        )
      );
    }
  }, {
    key: 'getFlagControl',
    value: function getFlagControl(flag) {

      var flagControl = void 0;

      if (flag.type == 'boolean') {
        console.log("boolean " + flag.value);

        var isChecked = flag.value == 'true';

        flagControl = React.createElement(FormControlLabel, {
          value: flag.name,
          control: React.createElement(Switch, { checked: isChecked, onChange: this.handleFlagChange.bind(this, flag),
            value: flag.value, color: 'primary' }),
          label: flag.name,
          labelPlacement: 'top'
        });
      } else if (flag.type == 'directory' || flag.type == 'filepath' || flag.name == 'outputdir') {

        flagControl = React.createElement(TextField, {
          id: 'flagControl',
          required: flag.required,
          label: flag.name,
          multiline: true,
          rowsMax: '4',
          value: flag.value,
          onClick: this.openFileDialog.bind(this, flag),
          variant: 'outlined'
        });
      } else if (flag.values && Array.isArray(flag.values)) {
        //select box control
        flagControl = React.createElement(
          TextField,
          {
            id: 'flagControl',
            required: flag.required,
            select: true,
            label: flag.name,
            value: flag.value,
            onChange: this.handleFlagChange.bind(this, flag),
            SelectProps: {
              native: true
            },
            variant: 'outlined'
          },
          React.createElement('option', { key: 'emptyVal', value: '' }),
          flag.values.map(function (val) {
            return React.createElement(
              'option',
              { key: val, value: val },
              val
            );
          })
        );
      } else if (flag.type == 'url' || flag.type == 'array') {
        flagControl = React.createElement(TextField, {
          id: 'flagControl',
          required: flag.required,
          label: flag.name,
          multiline: true,
          rowsMax: '4',
          value: flag.value,
          onChange: this.handleFlagChange.bind(this, flag),
          variant: 'outlined'
        });
      } else if (flag.type == 'minutes' || flag.type == 'number') {
        flagControl = React.createElement(TextField, { id: 'flagControl',
          required: flag.required,
          type: 'number',
          label: flag.name, variant: 'outlined',
          value: flag.value, onChange: this.handleFlagChange.bind(this, flag) });
      } else if (flag.type == 'option' && flag.options && Array.isArray(flag.options)) {
        //select box control
        flagControl = React.createElement(
          TextField,
          {
            id: 'flagControl',
            required: flag.required,
            select: true,
            label: flag.name,
            value: flag.value,
            onChange: this.handleFlagChange.bind(this, flag),
            SelectProps: {
              native: true
            },
            variant: 'outlined'
          },
          React.createElement('option', { key: 'emptyVal', value: '' }),
          flag.options.map(function (val) {
            return React.createElement(
              'option',
              { key: val, value: val },
              val
            );
          })
        );
      } else {
        flagControl = React.createElement(TextField, { id: 'flagControl',
          required: flag.required || false,
          label: flag.name, variant: 'outlined',
          value: flag.value, onChange: this.handleFlagChange.bind(this, flag) });
      }
      return flagControl;
    }
  }, {
    key: 'handleFlagChange',
    value: function handleFlagChange(flag, event) {
      var flagValue = event.target.value;
      var type = flag.type;

      if (flag.type == 'boolean') {
        //Switch control
        if (flagValue == 'true') {
          flag.value = 'false';
        } else {
          flag.value = 'true';
        }
      } else {
        //TextField control
        flag.value = flagValue;
      }

      var genCmd = this.generateCommand();
      this.setState({ generatedCmd: genCmd });
    }
  }, {
    key: 'openFileDialog',
    value: function openFileDialog(flag) {

      vscode.postMessage({
        command: 'openFileDialog',
        flag: flag
      });
    }
  }, {
    key: 'generateCommand',
    value: function generateCommand() {
      console.log('Inside generateCommand()');

      var generatedCmd = 'sfdx ' + this.props.selectedCommand.id;
      var genFlag = '';
      var selCommand = this.props.selectedCommand;

      console.log('Inside generateCommand() ' + generatedCmd + ' ' + JSON.stringify(selCommand));

      Object.values(selCommand.flags).forEach(function (flag) {

        if (flag.value && flag.value !== '') {
          if (flag.type == 'boolean') {
            //Switch control
            if (flag.value == 'true') {
              genFlag += ' --' + flag.name;
            }
          } else {
            //TextField
            genFlag += ' --' + flag.name + ' ' + flag.value;
          }

          console.log("genFlag " + genFlag);
        }
      });

      return generatedCmd + genFlag;
    }
  }, {
    key: 'handleBackNav',
    value: function handleBackNav() {
      this.props.onGoToHome();
    }
  }, {
    key: 'executeCommand',
    value: function executeCommand() {
      vscode.postMessage({
        command: 'executeCommand',
        generatedCmd: this.state.generatedCmd
      });
    }
  }, {
    key: 'copyToClipboard',
    value: function copyToClipboard() {
      vscode.postMessage({
        command: 'copyToClipboard',
        generatedCmd: this.state.generatedCmd
      });
    }
  }]);

  return CommandBuilder;
}(React.Component);

function CommandAppBar(props) {
  var classes = useStyles();

  var handleBackNav = function handleBackNav() {
    props.onHandleBackNav();
  };

  var showHelp = function showHelp() {

    var helpCmd = 'sfdx ' + props.selectedCommand.id + ' --help';
    vscode.postMessage({
      command: 'executeCommand',
      generatedCmd: helpCmd
    });
  };

  return React.createElement(
    'div',
    null,
    React.createElement(
      AppBar,
      { position: 'static' },
      React.createElement(
        Toolbar,
        null,
        React.createElement(
          IconButton,
          { edge: 'start', className: classes.menuButton,
            onClick: handleBackNav, color: 'inherit', 'aria-label': 'menu' },
          React.createElement(
            Icon,
            null,
            'arrow_back'
          )
        ),
        React.createElement(
          Typography,
          { variant: 'h6', className: classes.title },
          props.selectedCommand.id
        ),
        React.createElement(
          IconButton,
          { edge: 'start', color: 'inherit', onClick: showHelp,
            title: 'Help on this Command' },
          React.createElement(
            Icon,
            null,
            'help'
          )
        )
      )
    )
  );
}

function HomeAppBar(props) {
  var classes = useStyles();

  var handleChange = function handleChange(event) {
    props.onFilterChange(event.target.value);
  };

  return React.createElement(
    'div',
    null,
    React.createElement(
      AppBar,
      { position: 'static' },
      React.createElement(
        Toolbar,
        null,
        React.createElement(
          Typography,
          { className: classes.title, variant: 'h6', noWrap: true },
          'Salesforce CLI Command Builder'
        ),
        React.createElement(
          'div',
          { className: classes.search },
          React.createElement(
            'div',
            { className: classes.searchIcon },
            React.createElement(
              Icon,
              null,
              'search'
            )
          ),
          React.createElement(InputBase, {
            placeholder: 'Filter Commands...',
            classes: {
              root: classes.inputRoot,
              input: classes.inputInput
            },
            inputProps: { 'aria-label': 'search' },
            onChange: handleChange
          })
        )
      )
    )
  );
}

function ThemedApp() {
  var element = document.querySelector("body");

  var prefersDarkMode = element.classList.contains("vscode-dark");
  //const prefersDarkMode = useMediaQuery('(body.vscode-dark)');

  var preferredTheme = createMuiTheme({
    palette: {
      // Switching the dark mode on is a single property value change.
      type: prefersDarkMode ? 'dark' : 'light'
    }
  });

  return React.createElement(
    ThemeProvider,
    { theme: preferredTheme },
    React.createElement(App, null)
  );
}

ReactDOM.render(React.createElement(ThemedApp, null), document.getElementById('root'));