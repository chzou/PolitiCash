import React from 'react';

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
};

export default PanelOne;
