var Content = React.createClass({
	getInitialState: function() {
		return {
			selection: 0,
			name: '',
			cid: ''
		};
	},
	
	changeSelectionOne: function(val) {
		this.setState({selection: val});
	},
	
	changeSelectionTwo: function(val, name, cid) {
		this.setState({selection: val, name: name, cid: cid});
	},
	
	render: function() {
		return(
			<Tabs selection={this.state.selection} changeSelection={this.changeSelectionOne}>
				<PanelOne changeSelection={this.changeSelectionOne} />
				<PanelTwo changeSelection={this.changeSelectionTwo} />
				<PanelThree name={this.state.name} cid={this.state.cid} />
				<Panel>
					This is the content of Panel 4.
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
	
	changeSelection: function(val, name) {
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
	},
	
	changeErrorMessage: function(msg) {
		this.setState({errorMsg: msg});
	},
	
	getRepresentativesByZip: function(d) {
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
				<ResultSide
					changeSelection={this.changeSelection}
					results={this.state.results}
				/>
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

var ResultSide = React.createClass({
	
	processCandidates: function() {
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
		if (this.props.name != nextProps.name) {
			this.setState({selected: false});			
		}
	},
	
	// used to select or deselect an officer
	handleClickOne: function(e) {
		e.preventDefault();
		this.setState({selected: !this.state.selected});
	},
	
	// used to view financial history of officer
	handleClickTwo: function(e) {
		e.preventDefault();
		this.props.changeSelection(2, this.props.name);
	},
	
	checkUrl: function() {
		if (this.props.url.length > 0) {
			return (
				<p><a href={this.props.url}>Website</a></p>
			);
		} else {
			return (
				<div></div>
			);
		}
	},
	
	checkPhone: function() {
		if (this.props.phone.length > 0) {
			return (
				<p>Phone: {this.props.phone}</p>
			);
		} else {
			return (
				<div></div>
			);
		}
	},
	
	handleAdditionalInfo: function() {
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
	},
	
	render: function() {
		return (
			<div className='official'>
				<a className='official-name' onClick={this.handleClickOne}>
					{this.props.name}
				</a>
				{this.handleAdditionalInfo()}
			</div>
		);
	}
});

var PanelThree = React.createClass({
	
	getInitialState: function() {
		return {
			contribResults: {},
			industryResults: {},
			sectorResults: {}
		};
	},
	componentWillMount : function() {
		if (this.props.cid.length > 0) {
			this.getCandidateFinancialInfo(this.props.cid);
		}
	},
	getCandidateFinancialInfo: function(cid) {
		$.ajax({
			url: '/api/opensecrets',
			dataType: 'json',
			type: 'POST',
			data: {cid: cid},
			success: function(returned, status, xhr) {
				this.setState({
					contribResults: returned.candContrib,
					industryResults: returned.candIndustry,
					sectorResults: returned.candSector
				});
			}.bind(this),
			error: function(xhr, status, err) {
				console.error('/api/opensecrets', status, err.toString());
			}.bind(this)
		});
	},
	render: function() {
		if (this.props.cid.length > 0) {
			return (
				<div id='panelThree'>
					<p className='panelHeading'>{this.props.name}</p>
					<IndividualDonors data={JSON.stringify(this.state.contribResults)} />
					<SectorDonors data={JSON.stringify(this.state.sectorResults)} />
					<IndustryDonors data={JSON.stringify(this.state.industryResults)} />
				</div>
			);
		} else {
			return (
				<PlaceHolder />
			);
		}
	}
});

var PlaceHolder = React.createClass({
	render: function() {
		return (
			<div id='placeholder'>
				<div>
					<h1>page unavailable</h1>
					<p>Please select a candidate using the candidate lookup panel first!</p>
				</div>
			</div>
		);
	}
});

var IndividualDonors = React.createClass({
	processData: function() {
		var data = {
			labels: [],
			series: [[]]
		};
		
		var prop = JSON.parse(this.props.data);
		for (var i = 0; i < prop.length; i++) {
			var contributor = JSON.parse(JSON.stringify(prop[i]));
			data.labels.push(contributor.org_name);
			data.series[0].push(parseInt(contributor.total));
		}
		
		return data;
	},
	render: function() {
		return (
			<div>
				<p className='chartTitle'>Top Contributors</p>
				<BarChart data={this.processData()} chartName="contribChart" />
			</div>
		);
	}
});

var SectorDonors = React.createClass({
	processData: function() {
		var data = {
			labels: [],
			series: []
		};
		
		var prop = JSON.parse(this.props.data);
		for (var i = 0; i < prop.length; i++) {
			var sector = JSON.parse(JSON.stringify(prop[i]));
			data.labels.push(sector.sector_name);
			data.series.push(parseInt(sector.total));
		}
		
		return data;

	},	
	render: function() {
		return (
			<div>
				<p className='chartTitle'>Top Sectors</p>
				<PieChart data={this.processData()} chartName="sectorChart" />
				<ListChart data={this.processData()} />
			</div>
		);
	}
});

var IndustryDonors = React.createClass({
	processData: function() {
		var data = {
			labels: [],
			series: []
		};
		
		var prop = JSON.parse(this.props.data);
		for (var i = 0; i < prop.length; i++) {
			var industry = JSON.parse(JSON.stringify(prop[i]));
			data.labels.push(industry.industry_name);
			data.series.push(parseInt(industry.total));
		}
		
		return data;
	},
	render: function() {
		return (
			<div>
				<p className='chartTitle'>Top Industries</p>
				<PieChart data={this.processData()} chartName='industryChart' />
				<ListChart data={this.processData()} />
			</div>
		);
	}
});

var PieChart = React.createClass({
	componentWillReceiveProps: function (nextProps) {
		this.updateChart(nextProps.data);
	},
	updateChart: function (data) {
		var total = data.series.reduce(function sum(prev, curr) {
			return prev + curr;
		});
		var options = {
			labelInterpolationFnc: function(label, index) {
				return data.series[index] / total > 0.02 ? label : '';
			},
			chartPadding: 30,
			labelOffset: 90,
			labelDirection: 'explode'
		};
		var chart = new Chartist.Pie('.' + this.props.chartName, data, options);
		chart.on('draw', function() {
			$('.ct-slice-pie').mouseenter(function() {
				$('#tooltip2').removeClass('tooltip-hidden');
				$('#tooltip2').html(Math.round($(this).attr('ct:value') / total * 10000) / 100 + '<b> %</b>');
			});
			$('.ct-slice-pie').mouseleave(function() {
				$('#tooltip2').addClass('tooltip-hidden');
			});
			$('.ct-slice-pie').mousemove(function(event) {
				$('#tooltip2').css({
					left: event.pageX - $('#tooltip2').width() * 5,
					top: event.pageY - $('#tooltip2').height() - 10
				})
			});
		});
		return chart;
	},
	render: function() {
		return (
			<div className={this.props.chartName}>
				<div id='tooltip2' className='tooltip tooltip-hidden'></div>
			</div>
		);
	}
});

var BarChart = React.createClass({
	componentWillReceiveProps: function (nextProps) {
		this.updateChart(nextProps.data);
	},
	updateChart: function (data) {
		var options = {
			seriesBarDistance: 10,
			reverseData: true,
			horizontalBars: true,
			axisY: { offset: 200 }
		};
		var chart = new Chartist.Bar('.' + this.props.chartName, data, options);
		chart.on('draw', function() {
			$('.ct-bar').mouseenter(function() {
				$('#tooltip1').removeClass('tooltip-hidden');
				$('#tooltip1').html('<b>$ </b>' + $(this).attr('ct:value'));
			});
			$('.ct-bar').mouseleave(function() {
				$('#tooltip1').addClass('tooltip-hidden');
			});
			$('.ct-bar').mousemove(function(event) {
				$('#tooltip1').css({
					left: event.pageX - $('#tooltip1').width() * 5,
					top: event.pageY - $('#tooltip1').height() - 10
				});
			});
			$('.ct-label.ct-vertical').hover(function() {
				$(this).html('<a href=\'http://www.google.com/search?q=' + $(this).text().replace('&', '%26') + '\'>' + $(this).html() + '<\a>');
			});
		});
		return chart;
	},
	render: function() {
		return (
			<div>
				<div className={this.props.chartName}>
					<div id='tooltip1' className='tooltip tooltip-hidden'></div>
				</div>
			</div>
		);
	}
});

var ListChart = React.createClass({
	render: function() {
		var labelArray = this.props.data.labels;
		var items = labelArray.map(function(label) {
			return (
				<LegendItem index={labelArray.indexOf(label)}>
					{label}
				</LegendItem>
			);
		});
		
		return (
			<div className='list-legend'>
				{items}
			</div>
		);
	}
});

var LegendItem = React.createClass({
	render: function() {
		var names = 'legend-square legend-series-' + this.props.index;
		return(
			<div>
				<div className={names}></div>
				<p>{this.props.children}</p>
			</div>
		);
	}
});

ReactDOM.render(
	<Content />,
	document.getElementById('content')
);