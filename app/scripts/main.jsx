import React from 'react';
import {render} from 'react-dom';
import PanelTwo from './paneltwo.jsx';
import PanelOne from './panelone.jsx';
import PanelThree from './panelthree.jsx';
import '../stylesheets/main.css';

class Content extends React.Component {
	
	constructor() {
		super();
		this.state = {
			selection: 0,
			name: '',
			cid: ''
		};
		this.changeSelectionOne = this.changeSelectionOne.bind(this);
		this.changeSelectionTwo = this.changeSelectionTwo.bind(this);
	}
	
	changeSelectionOne(val) {
		this.setState({selection: val});
	}
	
	changeSelectionTwo(val, name, cid) {
		this.setState({selection: val, name: name, cid: cid});
	}
	
	render() {
		return(
			<Tabs selection={this.state.selection} changeSelection={this.changeSelectionOne}>
				<PanelOne changeSelection={this.changeSelectionOne} />
				<PanelTwo changeSelection={this.changeSelectionTwo} />
				<PanelThree name={this.state.name} cid={this.state.cid} />
			</Tabs>
		);
	}
}

class Tabs extends React.Component {
	
	constructor() {
		super();
		this.changeSelection = this.changeSelection.bind(this);
	}
	
	changeSelection(val) {
		this.props.changeSelection(val);
	}
	
	render() {
		return(
			<div id="firstContainer">
				<div id="navigation">
					<Tab selected={(this.props.selection == 0)} id={0} changeSelection={this.changeSelection}>
						Home
					</Tab>
					<Tab selected={(this.props.selection == 1)} id={1} changeSelection={this.changeSelection}>
						Candidate Lookup
					</Tab>
					<Tab selected={(this.props.selection == 2)} id={2} changeSelection={this.changeSelection}>
						By Candidate
					</Tab>
				</div>
				<div className="panel">
					{this.props.children[this.props.selection]}
				</div>
				<div id="bottomBar">
					<p>Data is from Center for Responsive Politics</p>
				</div>
			</div>
		);
	}
}

class Tab extends React.Component {
	
	constructor() {
		super();
		this.handleClick = this.handleClick.bind(this);
	}
	
	handleClick(e) {
		e.preventDefault();
		var id = this.props.id;
		this.props.changeSelection(id);
	}
	
	render() {
		return(
			<div className={(this.props.selected ? 'tab-selected' : 'tab-not-selected')}>
				<a onClick={this.handleClick}>
					{this.props.children}
				</a>
			</div>
		);
	}
}

render(
	<Content />,
	document.getElementById('content')
);