import React from 'react';
import Chartist from 'chartist';

class PanelThree extends React.Component {
	
	constructor() {
		super();
		this.state = {
			contribResults: {},
			industryResults: {},
			sectorResults: {}			
		};
		this.getCandidateFinancialInfo = this.getCandidateFinancialInfo.bind(this);
	}
	
	componentWillMount() {
		if (this.props.cid.length > 0) {
			this.getCandidateFinancialInfo(this.props.cid);
		}
	}
	
	getCandidateFinancialInfo(cid) {
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
	}
	
	render() {
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
	
}

class PlaceHolder extends React.Component {
	render() {
		return (
			<div id='placeholder'>
				<div>
					<h1>page unavailable</h1>
					<p>Please select a candidate using the candidate lookup panel first!</p>
				</div>
			</div>
		);
	}
}

class IndividualDonors extends React.Component {
	
	constructor() {
		super();
		this.processData = this.processData.bind(this);
	}
	
	processData() {
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
	}
	
	render() {
		return (
			<div>
				<p className='chartTitle'>Top Contributors</p>
				<BarChart data={this.processData()} chartName="contribChart" />
			</div>
		);
	}
	
}

class SectorDonors extends React.Component {

	constructor() {
		super();
		this.processData = this.processData.bind(this);
	}

	processData() {
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

	}
	
	render() {
		return (
			<div>
				<p className='chartTitle'>Top Sectors</p>
				<PieChart data={this.processData()} chartName="sectorChart" />
				<ListChart data={this.processData()} />
			</div>
		);
	}
	
}

class IndustryDonors extends React.Component {
	
	constructor() {
		super();
		this.processData = this.processData.bind(this);
	}

	processData() {
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
	}
	
	render() {
		return (
			<div>
				<p className='chartTitle'>Top Industries</p>
				<PieChart data={this.processData()} chartName='industryChart' />
				<ListChart data={this.processData()} />
			</div>
		);
	}
	
}

class PieChart extends React.Component {
	
	constructor() {
		super();
		this.updateChart = this.updateChart.bind(this);
	}
	
	componentWillReceiveProps(nextProps) {
		this.updateChart(nextProps.data);
	}
	
	updateChart(data) {
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
				$('#tooltip2').html('<b>$ </b>' + $(this).attr('ct:value') + '<br>('
									+ Math.round($(this).attr('ct:value') / total * 10000) / 100 + '<b>%</b>)');
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
	}
	
	render() {
		return (
			<div className={this.props.chartName}>
				<div id='tooltip2' className='tooltip tooltip-hidden'></div>
			</div>
		);
	}
	
}

class BarChart extends React.Component {
	
	constructor() {
		super();
		this.updateChart = this.updateChart.bind(this);
	}
	
	componentWillReceiveProps(nextProps) {
		this.updateChart(nextProps.data);
	}
	
	updateChart(data) {
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
	}
	
	render() {
		return (
			<div>
				<div className={this.props.chartName}>
					<div id='tooltip1' className='tooltip tooltip-hidden'></div>
				</div>
			</div>
		);
	}
	
}

class ListChart extends React.Component {
	render() {
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
}

class LegendItem extends React.Component {
	render() {
		var names = 'legend-square legend-series-' + this.props.index;
		return(
			<div>
				<div className={names}></div>
				<p>{this.props.children}</p>
			</div>
		);
	}
}

export default PanelThree;