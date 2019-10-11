import React, { Component } from 'react';
import './HistoryChart.css';
import ReactHighcharts from 'react-highcharts';
import _ from 'lodash';
import moment from 'moment';


ReactHighcharts.Highcharts.setOptions({
  time: {
    timezoneOffset: new Date().getTimezoneOffset()
  },
});

class HistoryChart extends Component {

  shouldComponentUpdate(nextProps, nextState) {

    // check for updates each time the alert list data refreshes
    if (nextProps.alertlistLastUpdate !== this.props.alertlistLastUpdate) {

      // update the first time alerts are loaded we will see them in the new props when old props have none
      if (nextProps.alertlist.length > this.props.alertlist.length) {
        this.updateSeriesFromPropsDelay();
      // else if the timestamp of the newest alert is greater than the existing one then update
      } else if (nextProps.alertlist[0].timestamp > this.props.alertlist[0].timestamp) {
        this.updateSeriesFromPropsDelay();
      }
    }
    // we never re-render this component since once highcharts is mounted, we don't want to re-render it over and over
    // we just want to use the update functions to update the existing chart
    return false;
  }

  updateSeriesFromPropsDelay() {
    setTimeout(() => {
      this.updateSeriesFromProps();
    }, 1000);
  }

  // multiple stacked charts for WARNING and CRITICAL
  updateSeriesFromProps() {
    // chart stuff
    let chart = this.refs.chart.getChart();
    //let results = this.props.alertlist;
    const groupBy = 'day';

    //const alertOks = this.props.alertlist.filter(alert => alert.state === 1 || alert.state === 8);
    //const groupedOks = _.groupBy(alertOks, (result) => moment(result.timestamp).startOf(groupBy).format('x'));

    const alertWarnings = this.props.alertlist.filter(alert => alert.state === 16);
    const groupedWarnings = _.groupBy(alertWarnings, (result) => moment(result.timestamp).startOf(groupBy).format('x'));
    
    // group the alerts into an object with keys that are for each day
    // this is a super awesome one liner for grouping
    const alertCriticals = this.props.alertlist.filter(alert => alert.state === 2 || alert.state === 32);
    const groupedCriticals = _.groupBy(alertCriticals, (result) => moment(result.timestamp).startOf(groupBy).format('x'));
    //console.log('HistoryChart updateSeriesFromProps() groupedResults', groupedResults);

    // disabling green on the chart for now
    // let okData = []
    // Object.keys(groupedOks).forEach(group => {
    //   okData.push({ x: parseInt(group), y: groupedOks[group].length });
    // });
    // chart.series[0].setData(okData.reverse());

    let warningData = []
    Object.keys(groupedWarnings).forEach(group => {
      warningData.push({ x: parseInt(group), y: groupedWarnings[group].length });
    });
    chart.series[0].setData(warningData.reverse());

    let criticalData = []
    Object.keys(groupedCriticals).forEach(group => {
      criticalData.push({ x: parseInt(group), y: groupedCriticals[group].length });
    });
    chart.series[1].setData(criticalData.reverse());

    // update pointWidth based on howManyItems
    //const howManyItems = this.props.alertDaysBack;
    //const screenWidth = window.innerWidth;
    //const barWidth = (screenWidth / howManyItems).toFixed(0); // this line probably needs work, I just made up the number
    //const barWidth = chart.series[0].barW / 1;

    // chart.update({
    //   plotOptions: {
    //     series: {
    //       pointWidth: barWidth
    //     }
    //   }
    // });

    // chart.series[0].redraw()

  }

  // componentDidMount() {
  // }

  // componentWillUnmount() {
  // }

  // UNSAFE_componentWillReceiveProps() {
  //  console.log('componentWillReceiveProps');
  // }

  chartConfig = {
    title: '',
    credits: false,
    chart: {
      backgroundColor:'transparent',
      height: '170px'
      //spacingTop: 0
    },

    legend:{ enabled:false },

    xAxis: {
      type: 'datetime',
      lineColor: '#222'
    },
    yAxis: {
      title: { text: '' },
      gridLineColor: '#222222',
      endOnTick: false,
      maxPadding: 0.1,
      stackLabels: {
        enabled: false
      }
    },

    plotOptions: {
      series: {
        pointPadding: 0.00
        //pointWidth: 21, // this is changed dynamically with a function above
        //pointPlacement: 'on'
      },
      column: {
        borderWidth: 0,
        stacking: 'normal',
        dataLabels: {
          enabled: false,
          //color: (ReactHighcharts.Highcharts.theme && ReactHighcharts.Highcharts.theme.dataLabelsColor) || 'white'
        }
      }
      // column: {
      //   pointRange: 1,
      //   pointPadding: 0.2,
      //   borderWidth: 0,
      //   stacking: "normal"
      // }
    },

    series: [
    // {
    //   type: 'column',
    //   name: 'UP/OK',
    //   color: 'lime'
    // },
    {
      type: 'column',
      name: 'WARNING',
      color: 'yellow'
    },
    {
      type: 'column',
      name: 'CRITICAL',
      color: '#FD7272'
    }]
  };

  render() {
    return (
      <div className="HistoryChart" style={{ paddingRight: '10px' }}>
        <ReactHighcharts config={this.chartConfig} ref="chart"></ReactHighcharts>
      </div>
    );
  }
}

export default HistoryChart;
