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
					It's no secret -- money affects politics. Politicians rely on campaign contributions to win
					elections, and there is a strong correlation between a representative's contributions and voting
					record. Find out which individuals, industries, and special interest groups are bankrolling
					your representatives.
				</p>
				<p>
					To use this app, use the <b>Candidate Lookup</b> tab (above) or
					simply click <b>Enter</b> (below). Enter your zip code to find representatives,
					and select <b>View Financial History</b> for financial information.
				</p>
				<p>
					<b>NOTE:</b> This app is not a deep research tool. Instead, it is intended to make political
					data more visual and easily-accessible.
				</p>
				<p>
					Created using HTML/CSS, Javascript, React, Node.js, and MongoDB.
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
