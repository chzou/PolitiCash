var React = require('react');

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
	
	getRepresentativesFromServer: function(d) {
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
		
	render: function() {
		return (
			<div>
				<SearchSide
					errorMsg={this.state.errorMsg}
					changeZip={this.getRepresentativesFromServer}
					changeErrorMessage={this.changeErrorMessage}
				/>
				<ResultSide results={this.state.results} />
			</div>
		);
	}
});

var SearchSide = React.createClass({
	handleSubmit: function(e) {
		e.preventDefault();
		var zip = this.refs.searchZip.value;
		if (zip.length != 5) {
			this.props.changeErrorMessage("Error: Invalid zip code");
			return;
		}
		this.props.changeZip({zipcode: zip});
		this.refs.searchZip.value = '';
	},
	render: function() {
		return (
			<div id="searchSide">
				<form onSubmit={this.handleSubmit}>
					<p>Enter your zip code here:</p>
					<input type="text" ref="searchZip" placeholder="Search..." />
				</form>
				<p>{this.props.errorMsg}</p>
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
					<div className="official">
						<p>{official.name}</p>
					</div>
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

module.exports = PanelTwo;