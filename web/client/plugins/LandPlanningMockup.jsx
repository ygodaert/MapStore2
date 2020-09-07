/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState } from 'react';
import Select from 'react-select';
const Slider = require('react-nouislider');
import { Tabs, Tab, Table, ButtonGroup, Button, ControlLabel, FormControl,
         Tooltip, OverlayTrigger, Row, Col, NavDropdown, MenuItem,
         DropdownButton, Checkbox, Radio, FormGroup,
         Panel, Nav, NavItem, Glyphicon } from "react-bootstrap";

import Modal from "../components/misc/Modal";
import { createPlugin } from '../utils/PluginsUtils';
import { toggleControl } from '../actions/controls';
import ColorPicker from '../components/style/ColorPicker';


// this is the entry point for the plugin
function LandPlanningMockup() {

    let [isShown , setIsShown] = useState(false);

    // fix this
    let f = ()=> {
        setIsShown(true);
    }

    // remove this
    document.addEventListener("open-land-planning", f)

    const handleClose = () => {
        setIsShown(false);
    }

    const handleHelp = () => {
        let url = "https://github.com/sigrennesmetropole/addon_urbanisme/wiki/Guide-Utilisateur";
        window.open(url, '_blank');
    }

    const handleADS = () => {
        alert("ADS button is clicked After clicking on map, a modal window `Eléments d'informations applicables à la parcelle cadastrale` will be opened");
    }

    const handleNRU = () => {
        alert("NRU button is toggled, After clicking on map, a modal window 'Réglementation applicable à la parcelle cadastrale' will be opened");
    }


    let className = isShown ? "land-planning-mockup" : "collapse";
    return (
        <div className={className}>
            <OverlayTrigger placement="bottom" overlay={<Tooltip>{"NRU - Renseignement d'urbanisme sur la parcelle"}</Tooltip>}>
                <Button
                    onClick={handleNRU}
                    bsStyle="primary"
                    className="square-button ms-close">
                    <Glyphicon glyph="zoom-to"></Glyphicon>
                </Button>
            </OverlayTrigger>
            <OverlayTrigger placement="bottom" overlay={<Tooltip>{"ADS - Renseignement d'urbanisme sur la fiche ads"}</Tooltip>}>
            <Button
                onClick={handleADS}
                bsStyle="primary"
                className="square-button ms-close">
                <Glyphicon glyph="info-sign"></Glyphicon>
            </Button>
            </OverlayTrigger>
            <OverlayTrigger placement="bottom" overlay={<Tooltip>{"Help"}</Tooltip>}>
            <Button
                onClick={handleHelp}
                bsStyle="primary"
                className="square-button ms-close">

                <Glyphicon glyph="question-sign"></Glyphicon>
            </Button>
            </OverlayTrigger>
            <OverlayTrigger placement="bottom" overlay={<Tooltip>{"Close"}</Tooltip>}>
                <Button
                    onClick={handleClose}
                    bsStyle="primary"
                    className="square-button ms-close">


                    <Glyphicon glyph="1-close"></Glyphicon>
                </Button>
            </OverlayTrigger>
        </div>
    );
}

// <OverlayTrigger placement="bottom" overlay={<Tooltip>{"Add a new Selection Tab"}</Tooltip>}>
// <Button
//     className="pull-right"
//     onClick={props.onNewTab}
// ><span className="glyphicon glyphicon-plus"></span>
// </Button>
// </OverlayTrigger>

export default createPlugin('LandPlanningMockup', {
    component: LandPlanningMockup,
    containers: {
        BurgerMenu:{
            name: 'landplanning',
            position: 1055,
            text: "LAND PLANNING",
            icon: <Glyphicon glyph="th-list"/>,
            action: () => {
                // fix this later
                document.dispatchEvent(new Event("open-land-planning"));
                return toggleControl('landplanning', 'enabled');
            },
            selector: (state, ownProps) => {},
            priority: 2,
            doNotHide: true
        }
    }
});
