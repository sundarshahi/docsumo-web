import React, { Component } from 'react';

import { InfoEmpty } from 'iconoir-react';
import { SUPPORT_LINK } from 'new/constants/urllink';
import Tooltip from 'new/ui-elements/Tooltip/Tooltip';
import { Bar } from 'react-chartjs-2';

import styles from './averagegraph.scss';

class AverageGraph extends Component {
  constructor(props) {
    super(props);
    this.state = {
      chartData: {},
    };
  }
  UNSAFE_componentWillMount() {
    const { data } = this.props;
    if (!data) {
      return;
    }
    this.setState({
      chartData: data,
    });
  }
  UNSAFE_componentWillReceiveProps(nextProps) {
    const { data } = this.props;
    const { data: nextData } = nextProps;
    if (data !== nextData) {
      this.setState({
        chartData: nextData,
      });
    }
  }
  render() {
    const { title, labelX, labelY } = this.props;
    return (
      <>
        <div className={styles.root}>
          <div className={styles.header}>
            <div className={styles.header_title}>{title}</div>

            <div className={styles.header_info}>
              <a
                target='_blank'
                rel='noopener noreferrer'
                href={SUPPORT_LINK.ANALYTICS_SCREEN}
              >
                <Tooltip label='Read more about usage analytics'>
                  <InfoEmpty className={styles.header_infoIcon} />
                </Tooltip>
              </a>
            </div>
          </div>
          <div className={styles.graphContent}>
            <Bar
              width={530}
              height={345}
              data={this.state.chartData}
              options={{
                legend: {
                  display: false,
                },
                tooltips: {
                  enabled: false,
                },
                maintainAspectRatio: false,
                scales: {
                  xAxes: [
                    {
                      barThickness: 25,
                      scaleLabel: {
                        display: false,
                        labelString: labelX,
                      },
                      ticks: {
                        fontSize: 10,
                      },
                      gridLines: {
                        display: false,
                      },
                    },
                  ],
                  yAxes: [
                    {
                      scaleLabel: {
                        display: true,
                        labelString: labelY,
                      },
                    },
                  ],
                },
              }}
            />
          </div>
        </div>
      </>
    );
  }
}
export default AverageGraph;
