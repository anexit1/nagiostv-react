/**
 * NagiosTV https://nagiostv.com
 * Copyright (C) 2008-2021 Chris Carey https://chriscarey.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import React, { Component } from 'react';
import './HostItem.css';
import { formatDateTime, formatDateTimeAgo, formatDateTimeAgoColor } from '../../helpers/moment.js';
import { hostBorderClass, hostTextClass } from '../../helpers/colors.js';
import { nagiosStateType, nagiosHostStatus } from '../../helpers/nagios.js';
import { translate } from '../../helpers/language';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import { playSoundEffectDebounced, speakAudio } from '../../helpers/audio';
import Progress from '../widgets/Progress';

class HostItem extends Component {

  componentDidMount() {
    if (this.props.settings.playSoundEffects) { this.doSoundEffect(); }
    if (this.props.settings.speakItems) { this.doSpeakIntro(); }
  }

  componentWillUnmount() {
    if (this.props.settings.playSoundEffects) {
      playSoundEffectDebounced('host', 'up', this.props.settings);
    }
    if (this.props.settings.speakItems) { this.doSpeakOutro(); }
  }

  doSoundEffect() {
    const status = nagiosHostStatus(this.props.hostItem.status);
    switch(status) {
      case 'down':
        playSoundEffectDebounced('host', 'down', this.props.settings);
        break;
      case 'unreachable':
        playSoundEffectDebounced('host', 'unreachable', this.props.settings);
        break;
      default:
        break;
    }
  }

  doSpeakIntro() {
    const { language } = this.props.settings;
    const voice = this.props.settings.speakItemsVoice;

    let words = translate('host', language) + ' ' + this.props.hostItem.name + ' '
      + translate('is', language) + ' ' + translate(nagiosHostStatus(this.props.hostItem.status), language);

    if (this.props.hostItem.is_flapping) { words += ' ' + translate('and', language) + ' ' + translate('flapping', language); }
    if (this.props.hostItem.problem_has_been_acknowledged) { words += ' ' + translate('and', language) + ' ' + translate('acked', language); }
    if (this.props.hostItem.scheduled_downtime_depth > 0) { words += ' ' + translate('and', language) + ' ' + translate('scheduled', language); }

    //console.log({words});
    speakAudio(words, voice);
  }

  doSpeakOutro() {
    const { language } = this.props.settings;
    const voice = this.props.settings.speakItemsVoice;
    const speakWords = translate('host', language) + ' ' + this.props.hostItem.name + ' ' + translate('ok', language);
    
    //console.log({speakWords});
    speakAudio(speakWords, voice);
  }

  mouseClick = () => {
    const e = this.props.hostItem
    const baseUrl = this.props.settings.baseUrl;
    const url = encodeURI(`${baseUrl}extinfo.cgi?type=1&host=${e.name}`);
    const win = window.open(url, '_blank');
    win.focus();
  }

  render() {

    const e = this.props.hostItem; // clean this up
    const isSoft = e.state_type === 0;
    const { language } = this.props.settings;
    const secondsToNextCheck = Math.floor((e.next_check - new Date().getTime()) / 1000);
    const nowTime = new Date().getTime();

    return (
      <div className={`HostItem`} onClick={this.mouseClick}>
        <div className={`HostItemBorder ${hostBorderClass(e.status)} ${isSoft ? 'host-item-soft' : 'host-item-hard'}`}>
          <div style={{ float: 'right', textAlign: 'right' }}>
            {/* soft */}
            {isSoft && <span className="softIcon color-red"><FontAwesomeIcon icon={faCircleNotch} spin /></span>}
            {/* notifications disabled */}
            {e.notifications_enabled === false && <span className="item-notifications-disabled">Notifications Disabled - </span>}
            {/* for debug turn this on to know what state_type this item is */}
            {1 === 2 && <span>({e.state_type})</span>}
            <span className={`uppercase host-item-state-type-${e.state_type}`}>{translate(nagiosStateType(e.state_type), language)}</span>{' '}
            {/* for debug turn this on to know what status this item is */}
            {1 === 2 && <span>({e.status})</span>}
            <span className={`uppercase ${hostTextClass(e.status)}`}>{translate(nagiosHostStatus(e.status), language)}</span>{' '}
            {e.problem_has_been_acknowledged && <span className="color-green uppercase"> {translate('acked', language)}</span>}
            {e.scheduled_downtime_depth > 0 && <span className="color-green uppercase"> {translate('scheduled', language)}</span>}
            {e.is_flapping && <span className="color-orange uppercase"> {translate('flapping', language)}</span>}
            <div className="last-ok"><span>{translate('Last UP', language)}</span> {formatDateTimeAgoColor(e.last_time_up)} {translate('ago', language)}</div>
          </div>

          <div>
            <div className="host-item-host-name">{e.name}</div>
            
            {/*<span className="alert-item-description">{e.description}</span>*/}
              
            <span className={hostTextClass(e.status)} style={{ marginLeft: '8px' }}>
              {e.plugin_output}
            </span>
          </div>

          <div className="next-check-in">
            {/*{translate('Last check was', language)}: <span className="color-peach">{formatDateTimeAgo(e.last_check)}</span> {translate('ago', language)}{' - '}*/}
            
            {/* active checks get "Next check in 5m 22s" */}
            {(e.check_type === 0 && e.next_check > nowTime) && <span>{translate('Next check in', language)}: <span className="color-peach"> {formatDateTime(e.next_check)}</span></span>}
            {(e.check_type === 0 && e.next_check <= nowTime) && <span className="checking-now"><FontAwesomeIcon icon={faCircleNotch} spin /> Checking now...</span>}

            {/* passive checks get "Last check 5m ago" */}
            {e.check_type === 1 && <span>Passive - Last check <span className="color-peach">{formatDateTimeAgo(e.last_check)}</span> ago</span>}
          </div>

          {/* comments */}
          {this.props.comments.length > 0 && <div>
            {this.props.comments.reverse().map((comment, i) => (
              <div className="comment" key={i}>
              Comment: <span className="comment-color">({comment.author}): {formatDateTimeAgo(comment.entry_time)} {translate('ago', language)} - {comment.comment_data}</span>
              </div>
            ))}
          </div>}

          {(e.check_type === 0 && this.props.settings.showNextCheckInProgressBar) && <Progress seconds={secondsToNextCheck} color={hostTextClass(e.status)}></Progress>}

        </div>
      </div>
    );
  }
}

export default HostItem;
