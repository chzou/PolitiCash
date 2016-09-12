import React from 'react';

class PanelTwo extends React.Component {
	
	constructor() {
		super();
		this.state = {
			errorMsg: '',
			results: {}
		};
		this.changeSelection = this.changeSelection.bind(this);
		this.changeErrorMessage = this.changeErrorMessage.bind(this);
		this.getRepresentativesByZip = this.getRepresentativesByZip.bind(this);
		this.getRepresentativesByName = this.getRepresentativesByName.bind(this);
	}
		
	changeSelection(val, name) {
		var nameArray = name.split(' ');
		$.ajax({
			url: '/api/getcid',
			dataType: 'text',
			type: 'POST',
			data: {
				first: nameArray[0].substring(0, 3), // uses only first three letters of first name
				last: nameArray[nameArray.length - 1] // uses full last name
			},
			success: function(returned, status, xhr) {
				this.props.changeSelection(val, name, returned);
			}.bind(this),
			error: function(xhr, status, err) {
				console.error('/api/getcid', status, err.toString());
			}.bind(this)
		});
	}
	
	changeErrorMessage(msg) {
		this.setState({errorMsg: msg});
	}
	
	getRepresentativesByZip(d) {
		$.ajax({
			url: '/api/googlecivics',
			dataType: 'json',
			type: 'POST',
			data: d,
			success: function(returned, status, xhr) {
				this.setState({errorMsg: '', results: returned});
			}.bind(this),
			error: function(xhr, status, err) {
				console.error('/api/googlecivics', status, err.toString());
				this.setState({errorMsg: 'Error: ' + err.toString()});
			}.bind(this)
		});
	}
	
	getRepresentativesByName(d) {
		// TODO
	}
	
	render() {
		return (
			<div id="panelTwo">
				<SearchSide
					errorMsg={this.state.errorMsg}
					changeZip={this.getRepresentativesByZip}
					changeName={this.getRepresentativesByName}
					changeErrorMessage={this.changeErrorMessage}
				/>
				<ResultSide
					changeSelection={this.changeSelection}
					results={this.state.results}
				/>
			</div>
		);
	}
	
}

class SearchSide extends React.Component {
	
	constructor() {
		super();
		this.handleSubmitZip = this.handleSubmitZip.bind(this);
		this.handleSubmitName = this.handleSubmitName.bind(this);
	}
	
	handleSubmitZip(e) {
		e.preventDefault();
		var zip = $('#searchZip').val();
		$('#searchZip').val('');
		if (zip.length != 5) {
			this.props.changeErrorMessage("Error: Invalid zip code");
			return;
		}
		this.props.changeZip({zipcode: zip});
	}
	
	handleSubmitName(e) {
		e.preventDefault();
		var name = $('#searchName').val();
		$('#searchName').val('');
		this.props.changeName({name: name});
	}
	
	render() {
		return (
			<div id="searchSide">
				<div className='formBlock'>
					<form onSubmit={this.handleSubmitZip}>
						<p className="searchPrompt">Enter your zip code here</p>
						<input type="text" id="searchZip" placeholder="" />
						<img src="./images/search.png" />
					</form>
					<p className="errorMessage">{this.props.errorMsg}</p>
				</div>
				<div className='formBlock'>
					<form onSubmit={this.handleSubmitName}>
						<p className="searchPrompt">Or search directly by name here</p>
						<input type="text" id="searchName" placeholder="" />
						<img src="./images/search.png" />
					</form>
				</div>
			</div>
		);
	}
	
}

class ResultSide extends React.Component {
	
	constructor() {
		super();
		this.processCandidates = this.processCandidates.bind(this);
	}
	
	processCandidates() {
		var changeSelection = this.props.changeSelection; // redefine bc "this" is not recognized
		var obj = JSON.parse(JSON.stringify(this.props.results)); // redefine JSON object -- TODO: way to circumvent this?
		if (JSON.stringify(obj).length < 10) { // shows nothing when no data is inputted
			return;
		}
		var processOne = obj.data.map(function(office) {
			office = JSON.parse(JSON.stringify(office));	// redefine JSON object
			var processTwo = office.officials.map(function(official) {
				official = JSON.parse(JSON.stringify(official)); // redefine JSON object
				var officialUrl, officialPhone;
				try { officialUrl = official.urls[0];
				} catch(err) { officialUrl = ''; }
				try { officialPhone = official.phones[0];
				} catch(err) { officialPhone = ''; }
				return (
					<OfficialInfo
						name={official.name}
						party={official.party}
						phone={officialPhone}
						url={officialUrl}
						changeSelection={changeSelection}
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

	}
	
	render() {
		return (
			<div id="resultSide">
				{this.processCandidates()}
			</div>
		);
	}
	
}

class OfficialInfo extends React.Component {
	
	constructor() {
		super();
		this.state = {
			selected: false
		};
		this.handleClickOne = this.handleClickOne.bind(this);
		this.handleClickTwo = this.handleClickTwo.bind(this);
		this.checkUrl = this.checkUrl.bind(this);
		this.checkPhone = this.checkPhone.bind(this);
		this.handleAdditionalInfo = this.handleAdditionalInfo.bind(this);
	}
		
	componentWillReceiveProps(nextProps) {
		if (this.props.name != nextProps.name) {
			this.setState({selected: false});			
		}
	}
	
	// used to select or deselect an officer
	handleClickOne(e) {
		e.preventDefault();
		this.setState({selected: !this.state.selected});
	}
	
	// used to view financial history of officer
	handleClickTwo(e) {
		e.preventDefault();
		this.props.changeSelection(2, this.props.name);
	}
	
	checkUrl() {
		if (this.props.url.length > 0) {
			return (
				<p><a href={this.props.url}>Website</a></p>
			);
		} else {
			return (
				<div></div>
			);
		}
	}
	
	checkPhone() {
		if (this.props.phone.length > 0) {
			return (
				<p>Phone: {this.props.phone}</p>
			);
		} else {
			return (
				<div></div>
			);
		}
	}
	
	handleAdditionalInfo() {
		if (!this.state.selected) {
			return;
		} else {
			return (
				<div className='official-info'>
					<img onClick={this.handleClickTwo} src="./images/export.png" />
					<p><span id='export-desc'>View Financial History</span></p>
					<p>Party: {this.props.party}</p>
					{this.checkPhone()}
					{this.checkUrl()}
				</div>
			);
		}
	}
	
	render() {
		return (
			<div className='official'>
				<a className='official-name' onClick={this.handleClickOne}>
					{this.props.name}
				</a>
				{this.handleAdditionalInfo()}
			</div>
		);
	}
	
}

export default PanelTwo;