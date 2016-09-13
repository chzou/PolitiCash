import React from 'react';
import '../stylesheets/panelone.css';

class PanelOne extends React.Component {
	
	constructor() {
		super();
		this.handleClick = this.handleClick.bind(this);
	}
	
	handleClick(e) {
		e.preventDefault();
		this.props.changeSelection(1);
	}
	
	render() {
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
					
				</p>
				</div>
				<div id="title">United States of $$$</div>
				<button onClick={this.handleClick} id='enterButton'>
					Enter &#9658;
				</button>
			</div>
		);
	}
};

export default PanelOne;
