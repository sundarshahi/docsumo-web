import React, { Component } from 'react';

import { InfoEmpty } from 'iconoir-react';
import { SUPPORT_LINK } from 'new/constants/urllink';
import Tooltip from 'new/ui-elements/Tooltip/Tooltip';
import { Bar } from 'react-chartjs-2';

import styles from './usageGraph.scss';

class UsageGraph extends Component {
  constructor(props) {
    super(props);
    this.state = {
      chartData: {},
    };
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { usage } = this.props;
    const { usage: nextUsage } = nextProps;
    if (usage !== nextUsage) {
      this.setState({
        chartData: nextUsage,
      });
    }
  }

  render() {
    const { title, option } = this.props;
    return (
      <>
        <div className={styles.root}>
          <div className={styles.header}>
            <div className={styles.header_first}>
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

            <div className={styles.graphIconContent}>
              {option.map(({ id, icon: Icon, color, number, status }) => {
                return (
                  <div className={styles.graphIconContent_itemWrapper} key={id}>
                    <div className={styles.graphIconContent_itemContent}>
                      <div
                        className={styles.graphIconContent_icon}
                        style={{ backgroundColor: color }}
                      >
                        <Icon />
                      </div>
                      <div className={styles.graphIconContent_detail}>
                        <span className={styles.graphIconContent_number}>
                          {number || 0}
                        </span>
                      </div>
                    </div>
                    <div className={styles.graphIconContent_status}>
                      {status}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className={styles.graphContent}>
            <Bar
              data={this.state.chartData}
              width={710}
              height={335}
              options={{
                legend: {
                  display: false,
                },
                maintainAspectRatio: false,
                tooltips: {
                  enabled: false,
                },
                scales: {
                  xAxes: [
                    {
                      stacked: true,
                      scaleLabel: {
                        display: false,
                        labelString: 'Weekly',
                      },
                      gridLines: {
                        display: false,
                      },
                    },
                  ],
                  yAxes: [
                    {
                      stacked: true,
                      scaleLabel: {
                        display: true,
                        labelString: 'No. of documents',
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
export default UsageGraph;
