var Content = React.createClass({
	getInitialState: function() {
		return {
			selection: 0
		};
	},
	
	changeSelection: function(val) {
		this.setState({selection: val});
	},
	
	render: function() {
		return(
			<Tabs selection={this.state.selection} changeSelection={this.changeSelection}>
				<PanelOne changeSelection={this.changeSelection} />
				<PanelTwo />
				<PanelThree />
				<Panel>
					This is the content of panel 4
				</Panel>
			</Tabs>
		);
	}
});

var Tabs = React.createClass({
	changeSelection: function(val) {
		this.props.changeSelection(val);
	},
	render: function() {
		return(
			<div id="firstContainer">
				<div id="navigation">
					<Tab selected={(this.props.selection == 0)} id={0} changeSelection={this.changeSelection}>Home</Tab>
					<Tab selected={(this.props.selection == 1)} id={1} changeSelection={this.changeSelection}>Candidate Lookup</Tab>
					<Tab selected={(this.props.selection == 2)} id={2} changeSelection={this.changeSelection}>By Candidate</Tab>
					<Tab selected={(this.props.selection == 3)} id={3} changeSelection={this.changeSelection}>By Party</Tab>
				</div>
				<div className="panel">
					{this.props.children[this.props.selection]}
				</div>
				<div id="bottomBar"></div>
			</div>
		);
	}
});

var Tab = React.createClass({
	handleClick: function(e) {
		e.preventDefault();
		var id = this.props.id;
		this.props.changeSelection(id);
	},
	render: function() {
		return(
			<div className={(this.props.selected ? 'tab-selected' : 'tab-not-selected')}>
				<a onClick={this.handleClick}>
					{this.props.children}
				</a>
			</div>
		);
	}
});

var Panel = React.createClass({
	render: function() {
		return(
			<div>
				{this.props.children}
			</div>
		);
	}
});

var PanelOne = React.createClass({
	handleClick: function(e) {
		e.preventDefault();
		this.props.changeSelection(1);
	},	
	render: function() {
		return (
			<div id="panelOne">
				<div id="explanation">
				<p>
					<span className='quote'>
					<span className='symbol'>&ldquo;</span>
					I&#39;ve always said that power is more important than money, but
					when it comes to elections, money gives power, well, a run for its money
					<span className='symbol'>&rdquo;</span>
					</span>
					<br />
					<span className='speaker'>
					&mdash; Frank Underwood
					</span>
					<br />
				</p>
				<p>
					Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed hendrerit est congue pretium dapibus.
					Mauris eleifend non nisi sed suscipit. Integer pulvinar gravida tortor, vel sodales sem laoreet eu.
					Proin egestas metus pellentesque ipsum imperdiet, in lacinia dui consequat. Aenean lorem massa,
					euismod pretium odio in, cursus feugiat purus. Etiam rutrum urna ut nunc vestibulum bibendum.
					Duis finibus cursus sapien vitae lobortis. Cras fringilla, mi sed interdum pharetra, dolor enim
					convallis purus, vel convallis odio ligula et magna. Suspendisse tempus, ligula fringilla feugiat finibus,
					ex ante facilisis magna, at ullamcorper lorem libero sit amet ante. Phasellus a sapien commodo, sollicitudin
					arcu nec, ultricies leo. In lacinia posuere ex, non iaculis dolor. Vestibulum mi ipsum, laoreet et risus sed,
					consequat efficitur ligula. Curabitur a lectus cursus, porta elit vitae, rhoncus nulla. Integer sodales
					libero at luctus tempor. Vestibulum eget velit at tellus aliquam sagittis. Ut id dolor ornare,
					bibendum ex ultrices, pellentesque nisi. Duis tincidunt quam volutpat, lacinia mi varius, volutpat enim.
					Integer sollicitudin ullamcorper arcu, id venenatis dui finibus quis. Aenean vulputate libero ac pulvinar
					vestibulum. Donec eget blandit mauris. Nullam vel lacus tincidunt dolor sodales dapibus. Nunc eu tincidunt
					lorem, vel maximus lacus. Suspendisse potenti. Nam cursus sem sapien, quis auctor nisi lacinia a.
					Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum ante ipsum primis in faucibus
					orci luctus et ultrices posuere cubilia Curae;
				</p>
				</div>
				<div id="title">United States of $$$</div>
				<button onClick={this.handleClick} id='enterButton'>
					Enter &#9658;
				</button>
			</div>
		);
	}
});

var PanelTwo = React.createClass({
	getInitialState: function() {
		return {
			errorMsg: '',
			results: {}
		};
	},
	
	changeErrorMessage: function(msg) {
		this.setState({errorMsg: msg});
	},
	
	getRepresentativesByZip: function(d) {
		$.ajax({
			url: '/api/representatives',
			dataType: 'json',
			type: 'POST',
			data: d,
			success: function(returned, status, xhr) {
				this.setState({errorMsg: '', results: returned});
			}.bind(this),
			error: function(xhr, status, err) {
				console.error('/api/representatives', status, err.toString());
				this.setState({errorMsg: 'Error: ' + err.toString()});
			}.bind(this)
		});
	},
	
	getRepresentativesByName: function(d) {
		// TODO
	},
	
	render: function() {
		return (
			<div id="panelTwo">
				<SearchSide
					errorMsg={this.state.errorMsg}
					changeZip={this.getRepresentativesByZip}
					changeName={this.getRepresentativesByName}
					changeErrorMessage={this.changeErrorMessage}
				/>
				<ResultSide results={this.state.results} />
			</div>
		);
	}
});

var SearchSide = React.createClass({
	handleSubmitZip: function(e) {
		e.preventDefault();
		var zip = this.refs.searchZip.value;
		this.refs.searchZip.value = '';
		if (zip.length != 5) {
			this.props.changeErrorMessage("Error: Invalid zip code");
			return;
		}
		this.props.changeZip({zipcode: zip});
	},
	handleSubmitName: function(e) {
		e.preventDefault();
		var name = this.refs.searchName.value;
		this.refs.searchName.value = '';
		this.props.changeName({name: name});
	},
	render: function() {
		return (
			<div id="searchSide">
				<div className='formBlock'>
					<form onSubmit={this.handleSubmitZip}>
						<p className="searchPrompt">Enter your zip code here</p>
						<input type="text" ref="searchZip" placeholder="" />
						<img src="./images/search.png" />
					</form>
					<p className="errorMessage">{this.props.errorMsg}</p>
				</div>
				<div className='formBlock'>
					<form onSubmit={this.handleSubmitName}>
						<p className="searchPrompt">Or search directly by name here</p>
						<input type="text" ref="searchName" placeholder="" />
						<img src="./images/search.png" />
					</form>
				</div>
			</div>
		);
	}
});

//TODO: process
var ResultSide = React.createClass({
	processCandidates: function() {
		var obj = JSON.parse(JSON.stringify(this.props.results)); // redefine JSON object -- TODO: way to circumvent this?
		if (JSON.stringify(obj).length < 10) { // shows nothing when no data is inputted
			return;
		}
		var processOne = obj.data.map(function(office) {
			office = JSON.parse(JSON.stringify(office));	// redefine JSON object
			var processTwo = office.officials.map(function(official) {
				official = JSON.parse(JSON.stringify(official)); // redefine JSON object
				return (
					<OfficialInfo
						name={official.name}
						party={official.party}
						phone={official.phones[0]}
						url={official.urls[0]}
					/>
				);
			});
			return (
				<div>
					<div className="office">
						<p>{office.name}</p>
					</div>
					{processTwo}
				</div>
			);
		});
		return (
			<div>
				{processOne}
			</div>
		);

	},	
	render: function() {
		return (
			<div id="resultSide">
				{this.processCandidates()}
			</div>
		);
	}
	
});

var OfficialInfo = React.createClass({
	getInitialState: function() {
		return {
			selected: false
		};
	},
	
	componentWillReceiveProps: function(nextProps) {
		if (this.props.url != nextProps.url) {
			this.setState({selected: false});			
		}
	},
	
	handleClick: function(e) {
		e.preventDefault();
		this.setState({selected: !this.state.selected});
	},
	
	handleAdditionalInfo: function() {
		if (!this.state.selected) {
			return;
		} else {
			return (
				<div className='official-info'>
					<img src="./images/export.png" />
					<p><span id='export-desc'>View Financial History</span></p>
					<p>Party: {this.props.party}</p>
					<p>Phone: {this.props.phone}</p>
					<p><a href={this.props.url}>Website</a></p>
				</div>
			);
		}
	},
	
	render: function() {
		return (
			<div className='official'>
				<a className='official-name' onClick={this.handleClick}>
					{this.props.name}
				</a>
				{this.handleAdditionalInfo()}
			</div>
		);
	}
});

var PanelThree = React.createClass({
	render: function() {
		return (
			<div>
				<h1>Candidate Name</h1>
				<IndividualDonors />
				<SectorDonors />
			</div>
		);
	}
});

// temp placeholder
var data = {
	series: [10, 2, 4, 6]
};

var IndividualDonors = React.createClass({
	render: function() {
		return (
			<div>
				<PieChart data={data} chartName="chart1" />
				<ListChart />
			</div>
		);
	}
});

var SectorDonors = React.createClass({
	render: function() {
		return (
			<div>
				<PieChart data={data} chartName="chart2" />
				<ListChart />
			</div>
		);
	}
});

var PieChart = React.createClass({
	componentDidMount: function () {
		this.updateChart(this.props.data);
	},
	updateChart: function (data) {
		return new Chartist.Pie('.' + this.props.chartName, data);
	},
	render: function() {
		return (
			<div className={this.props.chartName}></div>
		);
	}
});

var ListChart = React.createClass({
	render: function() {
		return (
			<div>List Chart </div>
		);
	}
});

ReactDOM.render(
	<Content />,
	document.getElementById('content')
);