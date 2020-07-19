//import Button from '@material-ui/core/Button';
//var Button = require("@material-ui/core/Button");
const vscode = acquireVsCodeApi();

const {
  Button,
  Grid,
  Paper,
  TextField,
  List,
  ListItem,
  ListItemText,
  Typography,
  Table,TableBody, TableCell,TableContainer,TableHead,TableRow,
  FormControlLabel,
  Switch,
  Icon,styles,AppBar,Toolbar,IconButton,makeStyles,fade,
  Card,CardActionArea,CardContent,CardActions,
  InputBase,
  ThemeProvider, useTheme, createMuiTheme,useMediaQuery 
} = MaterialUI;


const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
  search: {
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: fade(theme.palette.common.white, 0.25),
    },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      marginLeft: theme.spacing(3),
      width: 'auto',
    },
  },
  searchIcon: {
    width: theme.spacing(7),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputRoot: {
    color: 'inherit',
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 7),
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: 200,
    },
  }


}));

class App extends React.Component {

    constructor(props){
      super(props);
      this.state={
        commands : [],
        selectedCommand : null
      };

      this.fetchAllCommands();
      
      window.addEventListener('message', event => {
        const message = event.data; // The json data that the extension sent
        console.log(event.data);
        switch (message.command) {
            case 'onFetchAllCommands':
                let commandsArr=message.results;
                console.log("Inside App event listener "+commandsArr.length);
                this.setState({commands : commandsArr});
                break;
            
        }
      });

      //Event this bindings
      this.handleCommandSelect = this.handleCommandSelect.bind(this);
      this.handleGoToHome=this.handleGoToHome.bind(this);
    }


    render() {

      let searchCommand;
      if(this.state.commands && this.state.commands.length>0 && !this.state.selectedCommand){
        searchCommand=<SearchCommand commands={this.state.commands} onCommandSelect={this.handleCommandSelect}/> ;
      }

      let commandBuilder;
      if(this.state.selectedCommand){
        commandBuilder= <CommandBuilder selectedCommand={this.state.selectedCommand}
        onGoToHome={this.handleGoToHome}/>;
      }
   
      return (
       
          <Grid container >
            <Grid item xs={12}>
              {searchCommand} 
            </Grid>
            <Grid item xs={12}>
              {commandBuilder}
            </Grid>
          </Grid>
   
      );
    }

    fetchAllCommands(){
      vscode.postMessage({
        command: 'fetchAllCommands'
      });
    }

    handleCommandSelect(command){
      this.setState({selectedCommand : command});
    }

    handleGoToHome(){
      this.setState({selectedCommand : null});
    }
}

class SearchCommand extends React.Component{
  constructor(props){
    super(props);
    console.log("Inside SearchCommand constructor");
    this.commands=this.props.commands || [];
    console.log("this.commands");
    console.log(this.commands);
    //this.finalCommands=this.getFinalCommands();
    this.finalCommands=this.commands;
    this.state={
      filteredCommands :this.finalCommands
    }

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(value) {
    let filteredArr=this.getFilteredCommands(value);
    this.setState({filteredCommands: filteredArr});
  }

  /*getFinalCommands(){
    let finalCommandsArr = this.commands.filter(command=>{
      return !(command.mainTopic || command.hidden);

    });

    return finalCommandsArr;
  }*/

  getFilteredCommands(filterKey){

    console.log("filterKey "+filterKey);
    let filteredArr = this.finalCommands.filter(command=>{

      let flag=false;

      if(command && command.id && command.id!="" 
      && command.id.toUpperCase().includes(filterKey.toUpperCase())){
        flag|=true;
      }

      if(command && command.description && command.description!=""
      && command.description.toUpperCase().includes(filterKey.toUpperCase())){
        flag|=true;
      }


      return flag;
    });

    return filteredArr;
  }

  handleCommandClick(command){
    this.props.onCommandSelect(command);
  }

  render(){
    //this.setState({filteredCommands :this.commands});
    console.log("Inside SearchCommand render()");
    
    const filteredArr=this.state.filteredCommands.map(command => {
         
      return (<ListItem button key={command.id} divider alignItems="flex-start"
      onClick={this.handleCommandClick.bind(this,command)}>
        <ListItemText primary={command.id} 
        secondary={command.description}/>
      </ListItem>);
    
    });

    console.log("this.state.filteredCommands");
    console.log(this.state.filteredCommands);
    console.log(filteredArr);

    return (
      <div>
      <HomeAppBar onFilterChange={this.handleChange}/>
      <Grid container spacing={2} justify="center" alignItems="center">
        <Grid item xs={12}>
          <Paper square>
            <List component="nav">
            {filteredArr}
            </List>
          </Paper>
        </Grid>
      </Grid>
      </div>
    );
  }
}

/**
 * Builds the UI for Command Builder
 */
class CommandBuilder extends React.Component{

  constructor(props){
    super(props);
    console.log('Inside CommandBuilder constructor');
    this.state={selCommand : this.props.selectedCommand,
                generatedCmd : this.generateCommand()
              };

    window.addEventListener('message', event => {
      const message = event.data; // The json data that the extension sent
      console.log(event.data);
      switch (message.command) {
          case 'onFileSelected':
              let flag=message.results;
              console.log("Inside onFileSelected listener "+flag.value);
              let selCommand=this.props.selectedCommand;
              let fileFlags = Object.values(selCommand.flags).filter(flg=>{
                return flg.name==flag.name;
              });
              
              console.log("fileFlags "+JSON.stringify(fileFlags));
              if(fileFlags && fileFlags.length>0){
                fileFlags[0].value='"'+flag.value+'"';
              }
              console.log("fileFlags after "+JSON.stringify(fileFlags));
              
              this.setState({generatedCmd: this.generateCommand()});
              break;
          
      }
    });

    this.handleBackNav = this.handleBackNav.bind(this);
   
  }

  render(){


    return (
      <div>
      <CommandAppBar selectedCommand={this.state.selCommand}
      onHandleBackNav={this.handleBackNav}/>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Paper square style={{padding: 5}}>
            <br/>
            <Typography variant="body2" gutterBottom>
              {this.state.selCommand.description}
            </Typography>
            <br/>
            
            <Card raised>
              <CardActionArea>
                
                <CardContent>
                  <Typography gutterBottom variant="h6" component="h2">
                    Generated Command
                  </Typography>
                  <Typography variant="subtitle1" component="p">
                    {this.state.generatedCmd}
                  </Typography>
                </CardContent>
              </CardActionArea>
              <CardActions>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Icon>send</Icon>}
                  onClick={this.executeCommand.bind(this)}
                >
                  Execute
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Icon>file_copy</Icon>}
                  onClick={this.copyToClipboard.bind(this)}
                  >
                  Copy
                </Button>
              </CardActions>
            </Card>

            <br/>

            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Enter the Flag values</TableCell>
                  <TableCell>Description</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {/*this.state.selCommand.flags.map(flag => (
                  <TableRow key={flag.name}>
                    <TableCell component="th" scope="row">
                      
                      {this.getFlagControl(flag)}
                  
                    </TableCell>
                    <TableCell>{flag.description}</TableCell>
                  </TableRow>
                ))*/
                Object.values(this.state.selCommand.flags).map(flag => (
                  <TableRow key={flag.name}>
                  <TableCell component="th" scope="row">
                    
                    {this.getFlagControl(flag)}
                
                  </TableCell>
                  <TableCell>{flag.description}</TableCell>
               </TableRow>
              )
              )
                
                }

              </TableBody>
            </Table>
              


          </Paper>
        </Grid>
      </Grid>

      </div>
    );
  }

  getFlagControl(flag){

    let flagControl;

    if(flag.type=='boolean'){
      console.log("boolean "+flag.value);

      let isChecked = (flag.value=='true');
  
      flagControl= (<FormControlLabel
          value={flag.name}
          control={ <Switch checked={isChecked} onChange={this.handleFlagChange.bind(this,flag)} 
          value={flag.value} color="primary" />}
          label={flag.name}
          labelPlacement="top"
        />);

    }else if(flag.type=='directory' || flag.type=='filepath' || flag.name=='outputdir'){

       flagControl= (
        <TextField
          id="flagControl"
          required={flag.required}
          label={flag.name}
          multiline
          rowsMax="4"
          value={flag.value} 
          onClick={this.openFileDialog.bind(this,flag)}
          variant="outlined"
        />
        );

    }else if(flag.values && Array.isArray(flag.values)){
      //select box control
      flagControl= (
            <TextField
            id="flagControl"
            required={flag.required}
            select
            label={flag.name}
            value={flag.value}
            onChange={this.handleFlagChange.bind(this,flag)}
            SelectProps={{
              native: true
            }}
            variant="outlined"
          >
            <option key="emptyVal" value=""></option>
            {flag.values.map(val => (
              <option key={val} value={val}>
                {val}
              </option>
            ))}
          </TextField>
      );
    }
    else if(flag.type=='url' || flag.type=='array'){
      flagControl= (
        <TextField
          id="flagControl"
          required={flag.required}
          label={flag.name}
          multiline
          rowsMax="4"
          value={flag.value} 
          onChange={this.handleFlagChange.bind(this,flag)}
          variant="outlined"
        />
        );

    }else if(flag.type=='minutes' || flag.type=='number'){
      flagControl= (
        <TextField id="flagControl" 
        required={flag.required}
        type="number"
        label={flag.name} variant="outlined" 
        value={flag.value} onChange={this.handleFlagChange.bind(this,flag)}/>
        );
    }
    else if(flag.type=='option' && flag.options && Array.isArray(flag.options)){
      //select box control
      flagControl= (
        <TextField
        id="flagControl"
        required={flag.required}
        select
        label={flag.name}
        value={flag.value}
        onChange={this.handleFlagChange.bind(this,flag)}
        SelectProps={{
          native: true
        }}
        variant="outlined"
      >
        <option key="emptyVal" value=""></option>
        {flag.options.map(val => (
          <option key={val} value={val}>
            {val}
          </option>
        ))}
      </TextField>
      );
    }
    else{
      flagControl= (
        <TextField id="flagControl" 
        required={flag.required || false}
        label={flag.name} variant="outlined" 
        value={flag.value} onChange={this.handleFlagChange.bind(this,flag)}/>
        );
    }
    return flagControl;
  }

  handleFlagChange(flag,event){
    let flagValue=event.target.value;
    let type=flag.type;

    if(flag.type=='boolean'){
      //Switch control
      if(flagValue=='true'){
        flag.value='false';
      }else{
        flag.value='true';
      }

    }else{
      //TextField control
      flag.value=flagValue;

    }

    
    let genCmd=this.generateCommand();
    this.setState({generatedCmd: genCmd});

  }

  openFileDialog(flag){

    vscode.postMessage({
      command: 'openFileDialog',
      flag : flag
    });

   
  }

  generateCommand(){
    console.log('Inside generateCommand()');

    let generatedCmd = 'sfdx '+ this.props.selectedCommand.id;
    let genFlag='';
    let selCommand=this.props.selectedCommand;

    console.log('Inside generateCommand() '+generatedCmd +' '+JSON.stringify(selCommand));

    Object.values(selCommand.flags).forEach(flag => {

      if(flag.value && flag.value!==''){
        if(flag.type=='boolean'){
          //Switch control
          if(flag.value=='true'){
            genFlag += ' --' + flag.name;
          }
          
        }else{
          //TextField
          genFlag += ' --' + flag.name + ' ' +flag.value;
        }

        console.log("genFlag "+genFlag);
        
      }
    });

    return (generatedCmd+genFlag);
  }

  handleBackNav(){
    this.props.onGoToHome();
  }

  executeCommand(){
    vscode.postMessage({
      command: 'executeCommand',
      generatedCmd : this.state.generatedCmd
    });
    
  }

  copyToClipboard(){
    vscode.postMessage({
      command: 'copyToClipboard',
      generatedCmd : this.state.generatedCmd
    });
  }

  


}


function CommandAppBar(props) {
  const classes = useStyles();

  const handleBackNav = () => {
    props.onHandleBackNav();
  };

  const showHelp = ()=>{

    let helpCmd= 'sfdx '+ props.selectedCommand.id+' --help';
    vscode.postMessage({
      command: 'executeCommand',
      generatedCmd : helpCmd
    });
    
  }


  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <IconButton edge="start" className={classes.menuButton}
          onClick={handleBackNav} color="inherit" aria-label="menu">
          <Icon>arrow_back</Icon>
          </IconButton>
          <Typography variant="h6" className={classes.title}>
            {props.selectedCommand.id}
          </Typography>
          <IconButton edge="start" color="inherit" onClick={showHelp}
          title="Help on this Command">
          <Icon>help</Icon>
          </IconButton>
        </Toolbar>
      </AppBar>
    </div>
  );
}

function HomeAppBar(props) {
  const classes = useStyles();

  const handleChange = (event) => {
    props.onFilterChange(event.target.value);
  };


  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          
          <Typography className={classes.title} variant="h6" noWrap>
            Salesforce CLI Command Builder
          </Typography>
          <div className={classes.search}>
            <div className={classes.searchIcon}>
            <Icon>search</Icon>
            </div>
            <InputBase
              placeholder="Filter Commands..."
              classes={{
                root: classes.inputRoot,
                input: classes.inputInput,
              }}
              inputProps={{ 'aria-label': 'search' }}
              onChange={handleChange}
            />
          </div>
          
        </Toolbar>
      </AppBar>
    </div>
  );
}

function ThemedApp(){
  const element = document.querySelector("body");

  const prefersDarkMode = element.classList.contains("vscode-dark");
  //const prefersDarkMode = useMediaQuery('(body.vscode-dark)');

  const preferredTheme = createMuiTheme({
    palette: {
      // Switching the dark mode on is a single property value change.
      type: prefersDarkMode ? 'dark' : 'light',
    },
  });

  return(
    <ThemeProvider theme={preferredTheme}>
      <App/>
    </ThemeProvider>
  );
  

}

ReactDOM.render(<ThemedApp/>, document.getElementById('root'));