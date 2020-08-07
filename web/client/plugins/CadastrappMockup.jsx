/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState } from 'react';
import Select from 'react-select';
import { Tabs, Tab, Table, ButtonGroup, Button, ControlLabel, FormControl,
         Tooltip, OverlayTrigger, Row, Col, NavDropdown, MenuItem,
         Nav, NavItem, Glyphicon } from "react-bootstrap";

import Modal from "../components/misc/Modal";
import { createPlugin } from '../utils/PluginsUtils';
import { toggleControl } from '../actions/controls';

function randomString(length) {
    let s = "";
    for (let i=0;i<length;i++)
        s += String.fromCharCode(97 + randomInt(26));
    return s;
}

function randomInt(max) {
    return Math.floor(Math.random() * max);
}


var randomData = [["350238","AP","131  BD DE VERDUN","40","488"],["350238","AP","133  BD DE VERDUN","41","427"],["350238","AP","135  BD DE VERDUN","42","354"],["350238","AP","165  RUE DE SAINT MALO","43","300"],["350238","AP","167  RUE DE SAINT MALO","44","756"],["350238","AP","169  RUE DE SAINT MALO","45","789"],["350238","AP","13  ALL WILLIAM LOTH","46","181"],["350238","AP","11  ALL WILLIAM LOTH","47","223"],["350238","AP","9  ALL WILLIAM LOTH","48","204"],["350238","AP","7  ALL WILLIAM LOTH","49","214"],["350238","AP","171  RUE DE SAINT MALO","50","319"],["350238","AP","171B RUE DE SAINT MALO","51","377"],["350238","AP","5  ALL WILLIAM LOTH","52","134"],["350238","AP","3  ALL WILLIAM LOTH","53","108"],["350238","AP","173  RUE DE SAINT MALO","54","38"],["350238","AP","175  RUE DE SAINT MALO","55","756"],["350238","AP","177  RUE DE SAINT MALO","56","363"],["350238","AP","179  RUE DE SAINT MALO","57","325"],["350238","AP","181  RUE DE SAINT MALO","58","321"],["350238","AP","3  RUE GEORGES BIZET","59","262"],["350238","AP","4  ALL WILLIAM LOTH","60","519"],["350238","AP","5  RUE GEORGES BIZET","61","257"],["350238","AP","7  RUE GEORGES BIZET","62","259"],["350238","AP","6  ALL WILLIAM LOTH","63","717"],["350238","AP","9  RUE GEORGES BIZET","64","295"],["350238","AP","13  RUE GEORGES BIZET","67","334"],["350238","AP","12  RUE GEORGES BIZET","68","305"],["350238","AP","6  RUE GEORGES BIZET","71","883"],["350238","AP","183  RUE DE SAINT MALO","72","297"],["350238","AP","185  RUE DE SAINT MALO","73","311"],["350238","AP","189  RUE DE SAINT MALO","75","591"],["350238","AP","9  RUE JULES-BODIN","184","350"],["350238","AP","7  RUE JULES-BODIN","185","421"],["350238","AP","242  RUE DE SAINT MALO","186","681"],["350238","AP","5  RUE JULES-BODIN","187","400"],["350238","AP","3  RUE JULES-BODIN","188","355"],["350238","AP","240  RUE DE SAINT MALO","189","341"],["350238","AP","238B RUE DE SAINT MALO","190","760"],["350238","AP","6  RUE JULES-BODIN","192","425"],["350238","AP","8  RUE JULES-BODIN","193","443"],["350238","AP","10  RUE JULES-BODIN","194","479"],["350238","AP","12  RUE JULES-BODIN","195","397"],["350238","AP","19B RUE LE HUEROU","196","258"],["350238","AP","19  RUE LE HUEROU","197","266"],["350238","AP","17  RUE LE HUEROU","198","357"],["350238","AP","15  RUE LE HUEROU","199","540"],["350238","AP","236  RUE DE SAINT MALO","200","644"],["350238","AP","234D RUE DE SAINT MALO","201","122"],["350238","AP","234  RUE DE SAINT MALO","203","193"],["350238","AP","230  RUE DE SAINT MALO","206","40"],["350238","AP","230  RUE DE SAINT MALO","207","317"],["350238","AP","13  RUE LE HUEROU","209","350"],["350238","AP","11  RUE LE HUEROU","210","400"],["350238","AP","9  RUE LE HUEROU","211","403"],["350238","AP","7  RUE LE HUEROU","212","378"],["350238","AP","5  RUE LE HUEROU","213","383"],["350238","AP","3  RUE LE HUEROU","214","382"],["350238","AP","230  RUE DE SAINT MALO","216","128"],["350238","AP","230  RUE DE SAINT MALO","217","517"],["350238","AP","228  RUE DE SAINT MALO","218","229"],["350238","AP","226  RUE DE SAINT MALO","220","477"],["350238","AP","1  RUE BARTHELEMY-POCQUET","221","440"],["350238","AP","1B RUE BARTHELEMY-POCQUET","222","334"],["350238","AP","3  RUE BARTHELEMY-POCQUET","223","281"],["350238","AP","5  RUE BARTHELEMY-POCQUET","224","296"],["350238","AP","7  RUE BARTHELEMY-POCQUET","225","295"],["350238","AP","9  RUE BARTHELEMY-POCQUET","226","298"],["350238","AP","11  RUE BARTHELEMY-POCQUET","227","307"],["350238","AP","17  RUE BARTHELEMY-POCQUET","229","217"],["350238","AP","19  RUE BARTHELEMY-POCQUET","230","372"],["350238","AP","4  RUE LE HUEROU","233","106"],["350238","AP","4B RUE LE HUEROU","234","158"],["350238","AP","6B RUE LE HUEROU","238","681"],["350238","AP","8  RUE LE HUEROU","239","505"],["350238","AP","10  RUE LE HUEROU","240","603"],["350238","AP","12  RUE LE HUEROU","241","344"],["350238","AP","12  RUE LE HUEROU","242","196"],["350238","AP","14  RUE LE HUEROU","243","358"],["350238","AP","16  RUE LE HUEROU","244","445"],["350238","AP","18  RUE LE HUEROU","245","368"],["350238","AP","61  AV GROS MALHON","277","556"],["350238","AP","59  AV GROS MALHON","278","626"],["350238","AP","53  AV GROS MALHON","279","317"],["350238","AP","53  AV GROS MALHON","280","209"],["350238","AP","53  AV GROS MALHON","283","352"],["350238","AP","51  AV GROS MALHON","284","359"],["350238","AP","49  AV GROS MALHON","285","352"],["350238","AP","47  AV GROS MALHON","286","444"],["350238","AP","21  RUE BARTHELEMY-POCQUET","288","520"],["350238","AP","23  RUE BARTHELEMY-POCQUET","289","496"],["350238","AP","45  AV GROS MALHON","290","364"],["350238","AP","25  RUE BARTHELEMY-POCQUET","291","486"],["350238","AP","43  AV GROS MALHON","292","361"],["350238","AP","26  RUE BARTHELEMY-POCQUET","309","274"],["350238","AP","24  RUE BARTHELEMY-POCQUET","311","439"],["350238","AP","22  RUE BARTHELEMY-POCQUET","312","74"],["350238","AP","      RUE BARTHELEMY-POCQUET","313","85"],["350238","AP","      RUE BARTHELEMY-POCQUET","314","85"],["350238","AP","15  RUE DE LA POMPE","316","368"],["350238","AP","20  RUE BARTHELEMY-POCQUET","317","308"],["350238","AP","18  RUE BARTHELEMY-POCQUET","318","238"],["350238","AP","13  RUE DE LA POMPE","319","300"],["350238","AP","11  RUE DE LA POMPE","320","240"],["350238","AP","16  RUE BARTHELEMY-POCQUET","321","244"],["350238","AP","14  RUE BARTHELEMY-POCQUET","322","148"],["350238","AP","12  RUE BARTHELEMY-POCQUET","323","57"],["350238","AP","10B RUE BARTHELEMY-POCQUET","324","253"],["350238","AP","9  RUE DE LA POMPE","325","422"],["350238","AP","10  RUE BARTHELEMY-POCQUET","326","128"],["350238","AP","8  RUE BARTHELEMY-POCQUET","327","298"],["350238","AP","6  RUE BARTHELEMY-POCQUET","330","306"],["350238","AP","3  RUE DE LA POMPE","331","506"],["350238","AP","4  RUE BARTHELEMY-POCQUET","332","217"],["350238","AP","2  RUE BARTHELEMY-POCQUET","333","240"],["350238","AP","222  RUE DE SAINT MALO","334","233"],["350238","AP","220  RUE DE SAINT MALO","335","353"],["350238","AP","218  RUE DE SAINT MALO","336","320"],["350238","AP","216  RUE DE SAINT MALO","337","384"],["350238","AP","214  RUE DE SAINT MALO","338","383"],["350238","AP","2  RUE DE LA POMPE","339","3333"],["350238","AP","9101  RUE DE SAINT MALO","340","8"],["350238","AP","212  RUE DE SAINT MALO","341","497"],["350238","AP","13  RUE LE HUEROU","499","51"],["350238","AP","5  RUE DE LA POMPE","521","299"],["350238","AP","7  RUE DE LA POMPE","522","361"],["350238","AP","2  RUE LE HUEROU","527","181"],["350238","AP","2  RUE LE HUEROU","528","24"],["350238","AP","      RUE DE COETLOGON","568","1963"],["350238","AP","6  RUE LE HUEROU","576","357"],["350238","AP","6  RUE LE HUEROU","577","348"],["350238","AP","1  RUE PIERRE GERBIER","594","161"],["350238","AP","3  RUE PIERRE GERBIER","595","161"],["350238","AP","5  RUE PIERRE GERBIER","596","161"],["350238","AP","7  RUE PIERRE GERBIER","597","141"],["350238","AP","9  RUE PIERRE GERBIER","598","146"],["350238","AP","11  RUE PIERRE GERBIER","599","144"],["350238","AP","13  RUE PIERRE GERBIER","600","150"],["350238","AP","      ZAC DE COETLOGON","601","12"],["350238","AP","      ZAC DE COETLOGON","602","12"],["350238","AP","15  RUE PIERRE GERBIER","603","147"],["350238","AP","17  RUE PIERRE GERBIER","604","141"],["350238","AP","19  RUE PIERRE GERBIER","605","161"],["350238","AP","21  RUE PIERRE GERBIER","606","161"],["350238","AP","23  RUE PIERRE GERBIER","607","161"],["350238","AP","25  RUE PIERRE GERBIER","608","229"],["350238","AP","27  RUE PIERRE GERBIER","609","193"],["350238","AP","29  RUE PIERRE GERBIER","610","177"],["350238","AP","31  RUE PIERRE GERBIER","611","162"],["350238","AP","33  RUE PIERRE GERBIER","612","146"],["350238","AP","      ZAC DE COETLOGON","613","33"],["350238","AP","14  RUE JEAN SULIVAN","614","157"],["350238","AP","16  RUE JEAN SULIVAN","615","149"],["350238","AP","18  RUE JEAN SULIVAN","616","176"],["350238","AP","41  RUE DOYEN DURTELLE ST SAUVEUR","617","157"],["350238","AP","4  RUE PIERRE GERBIER","618","179"],["350238","AP","6  RUE PIERRE GERBIER","619","192"],["350238","AP","8  RUE PIERRE GERBIER","620","220"],["350238","AP","10  RUE PIERRE GERBIER","621","233"],["350238","AP","23  RUE DOYEN DURTELLE ST SAUVEUR","622","225"],["350238","AP","21  RUE DOYEN DURTELLE ST SAUVEUR","623","186"],["350238","AP","19  RUE DOYEN DURTELLE ST SAUVEUR","624","156"],["350238","AP","17  RUE DOYEN DURTELLE ST SAUVEUR","625","193"],["350238","AP","15  RUE DOYEN DURTELLE ST SAUVEUR","626","198"],["350238","AP","13  RUE DOYEN DURTELLE ST SAUVEUR","627","210"],["350238","AP","11  RUE DOYEN DURTELLE ST SAUVEUR","628","165"],["350238","AP","9  RUE DOYEN DURTELLE ST SAUVEUR","629","137"],["350238","AP","      ZAC DE COETLOGON","630","48"],["350238","AP","39  RUE DOYEN DURTELLE ST SAUVEUR","631","144"],["350238","AP","35  RUE DOYEN DURTELLE ST SAUVEUR","632","171"],["350238","AP","      ZAC DE COETLOGON","633","14"],["350238","AP","31  RUE DOYEN DURTELLE ST SAUVEUR","634","14"],["350238","AP","      ZAC DE COETLOGON","635","175"],["350238","AP","27  RUE DOYEN DURTELLE ST SAUVEUR","636","147"],["350238","AP","      ZAC DE COETLOGON","637","869"],["350238","AP","      ZAC DE COETLOGON","638","1106"],["350238","AP","      ZAC DE COETLOGON","639","681"],["350238","AP","      ZAC DE COETLOGON","640","261"],["350238","AP","      ZAC DE COETLOGON","641","930"],["350238","AP","      ZAC DE COETLOGON","642","454"],["350238","AP","      ZAC DE COETLOGON","643","790"],["350238","AP","      ZAC DE COETLOGON","644","520"],["350238","AP","      ZAC DE COETLOGON","645","94"],["350238","AP","      ZAC DE COETLOGON","646","542"],["350238","AP","4  SQ LOUIS MARIE DESCHAMPS","647","204"],["350238","AP","3  SQ LOUIS MARIE DESCHAMPS","648","218"],["350238","AP","2  SQ LOUIS MARIE DESCHAMPS","649","206"],["350238","AP","1  SQ LOUIS MARIE DESCHAMPS","650","58"],["350238","AP","      RUE JOSEPH LOTTE","660","15082"],["350238","AP","      ZAC DE COETLOGON","661","18"],["350238","AP","      ZAC DE COETLOGON","662","18"],["350238","AP","      ZAC DE COETLOGON","663","4"],["350238","AP","      ZAC DE COETLOGON","668","4"],["350238","AP","      ZAC DE COETLOGON","669","9"],["350238","AP","      RUE JULIEN OFFRAY D LA METTRIE","680","36"],["350238","AP","      RUE JULIEN OFFRAY D LA METTRIE","682","635"],["350238","AP","      RUE JULIEN OFFRAY D LA METTRIE","683","43"],["350238","AP","      RUE JULIEN OFFRAY D LA METTRIE","684","574"],["350238","AP","      RUE DOYEN DURTELLE ST SAUVEUR","685","606"],["350238","AP","      RUE DOYEN DURTELLE ST SAUVEUR","686","77"],["350238","AP","      RUE DOYEN DURTELLE ST SAUVEUR","687","1443"],["350238","AP","      RUE DOYEN DURTELLE ST SAUVEUR","688","125"],["350238","AP","      RUE DOYEN DURTELLE ST SAUVEUR","689","5"],["350238","AP","10  RUE JEAN SULIVAN","698","245"],["350238","AP","10B RUE JEAN SULIVAN","699","241"],["350238","AP","10T RUE JEAN SULIVAN","700","218"],["350238","AP","12  RUE JEAN SULIVAN","701","185"],["350238","AP","12B RUE JEAN SULIVAN","702","120"],["350238","AP","187  RUE DE SAINT MALO","719","222"],["350238","AP","187  RUE DE SAINT MALO","720","339"],["350238","AP","13  RUE BARTHELEMY-POCQUET","721","202"],["350238","AP","15  RUE BARTHELEMY-POCQUET","722","278"],["350238","AP","13  RUE BARTHELEMY-POCQUET","723","44"],["350238","AP","9001  RUE JEAN SULIVAN","726","618"],["350238","AP","238  RUE DE SAINT MALO","728","286"],["350238","AP","238  RUE DE SAINT MALO","729","354"],["350238","AP","228  RUE DE SAINT MALO","734","51"],["350238","AP","      RUE DE SAINT MALO","735","89"],["350238","AP","      RUE JULIEN OFFRAY D LA METTRIE","745","1986"],["350238","AP","      RUE JEAN SULIVAN","749","56"],["350238","AP","11  RUE GEORGES BIZET","755","395"],["350238","AP","11  RUE GEORGES BIZET","756","17"],["350238","AP","      RUE JEAN SULIVAN","770","25"],["350238","AP","      RUE JEAN SULIVAN","771","12"],["350238","AP","      RUE JEAN SULIVAN","773","33"],["350238","AP","      RUE JEAN SULIVAN","774","19"],["350238","AP","      RUE JEAN SULIVAN","776","15"],["350238","AP","      RUE JEAN SULIVAN","777","31"],["350238","AP","      RUE JEAN SULIVAN","778","17"],["350238","AP","      RUE JEAN SULIVAN","779","17"],["350238","AP","228A RUE DE SAINT MALO","785","1766"],["350238","AP","53  AV GROS MALHON","806","34"],["350238","AP","53  AV GROS MALHON","807","345"],["350238","AP","7  AV CHARLES ET RAYMONDE TILLON","818","3763"],["350238","AP","      RUE JEAN SULIVAN","836","90"],["350238","AP","201  RUE DE SAINT MALO","837","72"],["350238","AP","      RUE JEAN SULIVAN","838","4852"],["350238","AP","      RUE JEAN SULIVAN","840","332"],["350238","AP","      RUE JEAN SULIVAN","841","49"],["350238","AP","      RUE JEAN SULIVAN","842","47"],["350238","AP","      RUE JEAN SULIVAN","843","2806"],["350238","AP","      RUE JEAN SULIVAN","845","164"],["350238","AP","      RUE JEAN SULIVAN","850","313"],["350238","AP","      RUE JULIEN OFFRAY D LA METTRIE","851","277"],["350238","AP","      RUE JULIEN OFFRAY D LA METTRIE","852","261"],["350238","AP","      RUE JULIEN OFFRAY D LA METTRIE","853","109"],["350238","AP","      RUE JULIEN OFFRAY D LA METTRIE","854","178"],["350238","AP","      RUE JULIEN OFFRAY D LA METTRIE","855","403"],["350238","AP","      RUE JULIEN OFFRAY D LA METTRIE","857","59"],["350238","AP","10  RUE GEORGES BIZET","878","262"],["350238","AP","10  RUE GEORGES BIZET","890","23"],["350238","AP","10  RUE GEORGES BIZET","891","206"],["350238","AP","232  RUE JEAN MALO RENAULT","895","4"],["350238","AP","230  RUE DE SAINT MALO","896","29"],["350238","AP","230  RUE DE SAINT MALO","897","82"],["350238","AP","234  RUE DE SAINT MALO","898","6"],["350238","AP","8  RUE GEORGES BIZET","899","203"],["350238","AP","10  RUE GEORGES BIZET","900","3"],["350238","AP","10  RUE GEORGES BIZET","901","10"],["350238","AP","10  RUE GEORGES BIZET","902","77"],["350238","AP","10  RUE GEORGES BIZET","903","160"],["350238","AP","10  RUE GEORGES BIZET","904","11"],["350238","AP","234B RUE DE SAINT MALO","909","90"],["350238","AP","234B RUE DE SAINT MALO","910","111"],["350238","AR","      AV GROS MALHON","384","84321"],["350238","HR","       LES TROIS CROIX","12","10120"],["350238","HR","      AV CHARLES ET RAYMONDE TILLON","97","294"],["350238","HR","9000  AV CHARLES ET RAYMONDE TILLON","114","2092"],["350238","HR","5  AV CHARLES ET RAYMONDE TILLON","115","5735"],["350238","HR","6  RUE JEAN JULIEN LEMORDANT","198","774"],["350238","HR","4  RUE JEAN JULIEN LEMORDANT","199","911"],["350238","HR","4  RUE JEAN JULIEN LEMORDANT","200","835"]]

function randomPlot() {
    let d = [
        randomData[randomInt(randomData.length)][0],
        randomData[randomInt(randomData.length)][1],
        randomData[randomInt(randomData.length)][2],
        randomData[randomInt(randomData.length)][3],
        randomData[randomInt(randomData.length)][4]
    ]
    return d;
}


function MainToolbar(props) {
    // following array values are
    // 0: glyphicon
    // 1: action name
    // 2: tooltip text
    let toolbarOptions = [
        ["resize-full", "zoom", "Zoom to whole selection"],
        ["map-marker", "select-by-point", "Select / Activate / Unselect one plot with a simple click "],
        ["polyline", "select-by-linestring", "Select / Activate / Unselect plots which intersects a line"],
        ["polygon", "select-by-polygon", "Select / Activate / Unselect plots which intersects a polygon"],
        ["search-coords", "unit-de-fonc", "Landed property information"],
        ["zoom-to", "search-plots", "Plots Search"],
        ["search", "search-owners", "Owners Search"],
        ["user", "coownership", "Co-ownership data Search"],
        ["features-grid", "request-form", "Request on landholding trust"],
        ["cog", "preferences", "Preferences"],
        ["question-sign", "help", "Help"],
    ];

    let clickHandler = (action) => {
        return () => {
            props.onClick(action);
        }
    }

    let tooltipGenerator = (text) => {
        return <Tooltip id="tooltip">{text}</Tooltip>
    }

    return (
        <div className="side-bar pull-left">
            {toolbarOptions.map((v)=>(
                <OverlayTrigger placement="left" overlay={tooltipGenerator(v[2])}>
                    <Button
                        onClick={clickHandler(v[1])}
                        bsStyle="primary"
                        className={props.selected == v[1] ? "square-button btn-selected" : "square-button"}>
                            <span className={"glyphicon glyphicon-" + v[0]}></span>
                    </Button>
                </OverlayTrigger>
            ))}
        </div>
    )
}

function InformationFormModal(props) {
    return (
        <Modal
            dialogClassName="cadastrapp-modal"
            bodyClassName="overflow-hidden"
            show={props.isShown}
            onHide={props.onClose}>
            <Modal.Header closeButton>
                <Modal.Title>Information Form</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Tabs defaultActiveKey={1} id="uncontrolled-tab-example">
                    <Tab eventKey={1} title="Plot">
                    <Table condensed>
                        <thead>
                            <tr>
                                <th>Description</th>
                                <th>Valeur</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Town</td><td>1</td>
                            </tr>
                            <tr>
                                <td>Section</td><td>2</td>
                            </tr>
                            <tr>
                                <td>Plot</td><td>3</td>
                            </tr>
                            <tr>
                                <td>Voie</td><td>4</td>
                            </tr>
                            <tr>
                                <td>Address</td><td>5</td>
                            </tr>
                            <tr>
                                <td>Size DGFIP in m2</td><td>6</td>
                            </tr>
                            <tr>
                                <td>Size in m2</td><td>7</td>
                            </tr>
                            <tr>
                                <td>Plot with building</td><td>8</td>
                            </tr>
                            <tr>
                                <td>Plot with building</td><td>9</td>
                            </tr>

                        </tbody>
                    </Table>
                    </Tab>
                    <Tab eventKey={2} title="Owners">

                    </Tab>
                    <Tab eventKey={3} title="Co-Owners">
                    </Tab>
                    <Tab eventKey={4} title="Building(s)"></Tab>
                    <Tab eventKey={5} title="Subdivisions Fiscales"></Tab>
                    <Tab eventKey={6} title="Mutation History"></Tab>
                </Tabs>
            </Modal.Body>
        </Modal>
    )
}

function PreferencesModal(props) {
    return (
        <Modal
            dialogClassName="cadastrapp-modal"
            show={props.isShown} onHide={props.onClose}>
            <Modal.Header closeButton>
                <Modal.Title>Preferences</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="item-row">
                    <div className="label-col">
                        <ControlLabel>Highlight Color</ControlLabel>
                    </div>
                    <div className="form-col">
                        <Select></Select>
                    </div>
                </div>
                <div className="item-row">
                    <div className="label-col">
                        <ControlLabel>Opacity</ControlLabel>
                    </div>
                    <div className="form-col">
                        <Select></Select>
                    </div>
                </div>
                <div className="item-row">
                    <div className="label-col">
                        <ControlLabel>Stroke</ControlLabel>
                    </div>
                    <div className="form-col">
                        <Select></Select>
                    </div>
                </div>
                <div className="item-row">
                    <div className="label-col">
                        <ControlLabel>Stroke Color</ControlLabel>
                    </div>
                    <div className="form-col">
                        <Select></Select>
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button>Save</Button>
            </Modal.Footer>
        </Modal>
    )
}

function RequestFormModal(props) {

    const userTypeOptions = [
        { value: '0', label: 'Administration' },
        { value: '1', label: 'P1 - User with Rights' },
        { value: '2', label: 'P2 - Representative' },
        { value: '3', label: 'P3 - Normal user' }
    ]
    return (
        <Modal
            dialogClassName="cadastrapp-modal"
            show={props.isShown} onHide={props.onClose}>
            <Modal.Header closeButton>
                <Modal.Title>Request on landholding trust</Modal.Title>
            </Modal.Header>
            <Modal.Body>

                <div className="item-row">
                    <div className="label-col">
                        <ControlLabel>Request User Type</ControlLabel>
                    </div>
                    <div className="form-col">
                        <Select options={userTypeOptions}></Select>
                    </div>
                </div>

                <div className="item-row">
                    <div className="label-col">
                        <ControlLabel>CNI</ControlLabel>
                    </div>
                    <div className="form-col">
                        <FormControl type="text" bsSize="sm"></FormControl>
                    </div>
                </div>

                <div className="item-row">
                    <div className="label-col">
                        <ControlLabel>Last Name</ControlLabel>
                    </div>
                    <div className="form-col">
                        <FormControl type="text" bsSize="sm"></FormControl>
                    </div>
                </div>

                <div className="item-row">
                    <div className="label-col">
                        <ControlLabel>First Name</ControlLabel>
                    </div>
                    <div className="form-col">
                        <FormControl type="text" bsSize="sm"></FormControl>
                    </div>
                </div>

                <div className="item-row">
                    <div className="label-col">
                        <ControlLabel>Road Number</ControlLabel>
                    </div>
                    <div className="form-col">
                        <FormControl type="text" bsSize="sm"></FormControl>
                    </div>
                </div>

                <div className="item-row">
                    <div className="label-col">
                        <ControlLabel>Zip Code</ControlLabel>
                    </div>
                    <div className="form-col">
                        <FormControl type="text" bsSize="sm"></FormControl>
                    </div>
                </div>

                <div className="item-row">
                    <div className="label-col">
                        <ControlLabel>Town, Municipality</ControlLabel>
                    </div>
                    <div className="form-col">
                        <FormControl type="text" bsSize="sm"></FormControl>
                    </div>
                </div>

                <div className="item-row">
                    <div className="label-col">
                        <ControlLabel>Mail</ControlLabel>
                    </div>
                    <div className="form-col">
                        <FormControl type="text" bsSize="sm"></FormControl>
                    </div>
                </div>

            </Modal.Body>
            <Modal.Footer>
                <Button>Cancel Request</Button>
                <Button>Print Request</Button>
                <Button>Generate Documents</Button>
            </Modal.Footer>
        </Modal>)
}

function PlotsSelectionTable(props) {

    return (
        <Table condensed>
            <thead>
                <tr>
                    <th>Town</th>
                    <th>Section</th>
                    <th>Plan Number</th>
                    <th>Cadastral Address</th>
                    <th>Surface DGFIP in m2</th>
                </tr>
            </thead>
            <tbody>
                {props.data.map((r, index)=>(
                    <tr>
                    <td>{r[0]}</td>
                    <td>{r[1]}</td>
                    <td>{r[2]}</td>
                    <td>{r[3]}</td>
                    <td>{r[4]}</td>
                    </tr>
                ))}

            </tbody>
        </Table>
    )
}

function PlotSelectionTabContent(props) {
    return (
        <Col sm={12}>
            <Tab.Content animation>
                {props.data.map((value, index)=>(
                    <Tab.Pane eventKey={index}>
                        <PlotsSelectionTable data={props.data[index]}></PlotsSelectionTable>
                    </Tab.Pane>
                ))}
            </Tab.Content>
        </Col>
    )
}

function PlotSelectionTabActionButtons(props) {
    return (
        <ButtonGroup className="pull-right">
            <Button
                className="pull-right"
                onClick={props.onNewTab}
            ><span className="glyphicon glyphicon-plus"></span>
            </Button>
            <Button
                className="pull-right"
                onClick={props.onTabDelete}>
                <Glyphicon glyph="trash"/>
            </Button>
        </ButtonGroup>
    )
}

function PlotSelectionTabs(props) {
    return (
        <Tab.Container
            onSelect={props.onTabChange}
            activeKey={props.active}
            defaultActiveKey={props.active}>
            <Row className="clearfix">
                <Col sm={12}>
                    <Nav bsStyle="tabs">
                        {props.data.map((value, index)=>(
                            <NavItem eventKey={index}>
                                {"Selection " + (index+1).toString()}
                            </NavItem>
                        ))}
                        <PlotSelectionTabActionButtons {...props}>
                        </PlotSelectionTabActionButtons>
                    </Nav>
                </Col>
                <PlotSelectionTabContent {...props}></PlotSelectionTabContent>
            </Row>
        </Tab.Container>
    )
}

function PlotSelectionTabsWithDropdown(props) {
    let otherSelectionIndex = props.active + 1;
    if (otherSelectionIndex < 3)
        otherSelectionIndex = "3+ ";

    return (
        <Tab.Container
            onSelect={props.onTabChange}
            activeKey={props.active}
            defaultActiveKey={props.active}>
            <Row className="clearfix">
                <Col sm={12}>
                    <Nav bsStyle="tabs">
                        <NavItem eventKey={0}>
                            Selection 1
                        </NavItem>
                        <NavItem eventKey={1}>
                            Selection 2
                        </NavItem>
                        <NavDropdown title={"Selection " + otherSelectionIndex}>
                        {props.data.slice(2).map((value, index)=>(
                            <MenuItem eventKey={index+2}>
                                {"Selection " + (index+2+1).toString()}
                            </MenuItem>
                        ))}
                        </NavDropdown>
                        <PlotSelectionTabActionButtons {...props}>
                        </PlotSelectionTabActionButtons>
                    </Nav>
                </Col>
                <PlotSelectionTabContent {...props}></PlotSelectionTabContent>
            </Row>
        </Tab.Container>
    )
}

function PlotsSelection(props) {

    let className = props.data.length == 0 ? "collapse" : "plots-selection";
    let TabComponent = props.data.length > 3 ? PlotSelectionTabsWithDropdown : PlotSelectionTabs;

    return (
        <div className={className}>
            <hr/>
            <h3>Plots Selection</h3>
            <TabComponent {...props}></TabComponent>

            <ButtonGroup>
                <Button
                    onClick={()=>{ props.onClick("zoom") }}
                >Zoom</Button>
                <Button
                    onClick={()=>{ props.onClick("landry") }}
                >Landry Property</Button>
                <Button
                    onClick={()=>{ props.onClick("information-form") }}
                >Information Form</Button>
                <Button
                    onClick={()=>{ props.onClick("export") }}
                >Export</Button>
                <Button
                    onClick={props.onClear}
                >Close</Button>
            </ButtonGroup>
        </div>
    )
}

function CoownershipSearch(props) {
    const className = props.isShown ? "coownership-search" : "collapse";
    return (
        <div className={className}>
            <h3>Co-ownership Search</h3>

            <div className="item-row">
                <div className="label-col">
                    <ControlLabel>Town Municipality</ControlLabel>
                </div>
                <div className="form-col">
                    <FormControl type="text" bsSize="sm"></FormControl>
                    <div className="text-muted">ex: Rennes, Cesson-Sevigne</div>
                </div>
            </div>

            <div className="item-row">
                <div className="label-col">
                    <ControlLabel>Last name and First name</ControlLabel>
                </div>
                <div className="form-col">
                    <FormControl type="text" bsSize="sm"></FormControl>
                    <div className="text-muted">ex: Jego Pierre</div>
                </div>
            </div>

            <div className="item-row">
                <div className="label-col">
                    <ControlLabel>Plot id</ControlLabel>
                </div>
                <div className="form-col">
                    <FormControl type="text" bsSize="sm"></FormControl>
                    <div className="text-muted">ex: 20148301032610C0012</div>
                </div>
            </div>

            <div className="item-row">
                <div className="label-col">
                    <ControlLabel>Owner id</ControlLabel>
                </div>
                <div className="form-col">
                    <FormControl type="text" bsSize="sm"></FormControl>
                    <div className="text-muted">ex. 350001+00160</div>
                </div>
            </div>

            <ButtonGroup>
                <Button>Clear</Button>
                <Button
                    onClick={props.onSearch}
                    bsStyle="primary" >Search
                </Button>
            </ButtonGroup>
        </div>
    )
}

// var r = [];
// for (var i=0;i<lines.length;i++)
// {
//     var l = lines[i].split(";");
//     var arr = [];
//     arr.push(l[1]);
//     arr.push(l[7]);
//     arr.push(l[2]+l[3]+" " + l[4]+" " + l[5]);
//     arr.push(l[8]);
//     arr.push(l[9]);
//     r.push(arr);
// }


function PlotsSearch(props) {
    const className = props.isShown ? "plots-search" : "collapse";
    return (
        <div className={className}>
            <h3>Plots Search</h3>
            <Tabs defaultActiveKey={1} id="uncontrolled-tab-example">
                <Tab eventKey={1} title="Reference">
                    <div className="item-row">
                        <div className="label-col">
                            <ControlLabel>Town, Municipality</ControlLabel>
                        </div>
                        <div className="form-col">
                            <Select></Select>
                        </div>
                    </div>
                    <div className="item-row">
                        <div className="label-col">
                            <ControlLabel>Reference(s)</ControlLabel>
                        </div>
                        <div className="form-col">
                            <FormControl type="text" bsSize="sm"></FormControl>
                        </div>
                    </div>
                </Tab>
                <Tab eventKey={2} title="Cadastral Addr.">
                    <div className="item-row">
                        <div className="label-col">
                            <ControlLabel>Town, Municipality</ControlLabel>
                        </div>
                        <div className="form-col">
                            <Select></Select>
                        </div>
                    </div>
                    <div className="item-row">
                        <div className="label-col">
                            <ControlLabel>Name or locality</ControlLabel>
                        </div>
                        <div className="form-col">
                            <FormControl type="text" bsSize="sm"></FormControl>
                        </div>
                    </div>
                    <div className="item-row">
                        <div className="label-col">
                            <ControlLabel>Road Number</ControlLabel>
                        </div>
                        <div className="form-col">
                            <FormControl type="text" bsSize="sm"></FormControl>
                        </div>
                    </div>
                </Tab>
                <Tab eventKey={3} title="Cadastral ID">
                    <div className="item-row">
                        <div className="label-col">
                            <ControlLabel>Identifier</ControlLabel>
                        </div>
                        <div className="form-col">
                            <FormControl type="text" bsSize="sm"></FormControl>
                        </div>
                    </div>
                </Tab>
                <Tab eventKey={4} title="Lot">
                    <div className="item-row">
                        <div className="label-col">
                            <ControlLabel>Identifiers</ControlLabel>
                        </div>
                        <div className="form-col">
                            <FormControl
                                componentClass="textarea"
                                type="text"
                                bsSize="sm">
                            </FormControl>
                        </div>
                    </div>

                    <div className="item-row">
                        <div className="label-col">
                            <ControlLabel>Path</ControlLabel>
                        </div>
                        <div className="form-col">
                            <FormControl type="text" bsSize="sm"></FormControl>
                        </div>
                    </div>
                </Tab>
            </Tabs>
            <ButtonGroup>
                <Button>Clear</Button>
                <Button
                    bsStyle="primary"
                    onClick={props.onSearch}
                >Search</Button>
            </ButtonGroup>
        </div>
    )
}

function OwnersSearch(props) {
    const className = props.isShown ? "owners-search" : "collapse";
    return (
        <div className={className}>
            <h3>Owners Search</h3>
            <Tabs defaultActiveKey={1} id="uncontrolled-tab-example">
                <Tab eventKey={1} title="User or birthname">
                    <div className="item-row">
                        <div className="label-col">
                            <ControlLabel>Town, Municipality</ControlLabel>
                        </div>
                        <div className="form-col">
                            <Select></Select>
                        </div>
                    </div>
                    <div className="item-row">
                        <div className="label-col">
                            <ControlLabel>Reference(s)</ControlLabel>
                        </div>
                        <div className="form-col">
                            <FormControl type="text" bsSize="sm"></FormControl>
                        </div>
                    </div>
                </Tab>
                <Tab eventKey={2} title="Owner Identifier">
                    <div className="item-row">
                        <div className="label-col">
                            <ControlLabel>Town, Municipality</ControlLabel>
                        </div>
                        <div className="form-col">
                            <Select></Select>
                        </div>
                    </div>
                    <div className="item-row">
                        <div className="label-col">
                            <ControlLabel>Name or locality</ControlLabel>
                        </div>
                        <div className="form-col">
                            <FormControl type="text" bsSize="sm"></FormControl>
                        </div>
                    </div>
                    <div className="item-row">
                        <div className="label-col">
                            <ControlLabel>Road Number</ControlLabel>
                        </div>
                        <div className="form-col">
                            <FormControl type="text" bsSize="sm"></FormControl>
                        </div>
                    </div>
                </Tab>
                <Tab eventKey={3} title="Lot">
                    <div className="item-row">
                        <div className="label-col">
                            <ControlLabel>Identifier</ControlLabel>
                        </div>
                        <div className="form-col">
                            <FormControl type="text" bsSize="sm"></FormControl>
                        </div>
                    </div>
                </Tab>
            </Tabs>
            <ButtonGroup>
                <Button>Clear</Button>
                <Button
                    onClick={props.onSearch}
                    bsStyle="primary" >Search
                </Button>
            </ButtonGroup>
        </div>
    )
}

function RequestObject(props) {

}

function RequestObjectItem(props) {

    const requestOptions = [
        { value: 'owner-id', label: 'Owner id' },
        { value: 'plot', label: 'Plot' },
        { value: 'co-owners', label: 'co-owners' },
        { value: 'plot-id', label: 'Plot id' },
        { value: 'owner', label: 'Owner' },
        { value: 'cadastrapp-demandei', label: 'cadastrapp.demandei' },
        { value: 'lot-co-owners', label: 'Lot co-owners' },
    ]

    return (
        <Row>
            <Col>
                <Select options={requestOptions}></Select>
            </Col>
        </Row>
    );
}

function RequestObjectOwnerId(props) {

}

function RequestObjectPlot(props) {

}





function CadastrappMockup() {

    let [isShown , setIsShown] = useState(false);
    let [isRequestFormShown , setIsRequestFormShown] = useState(false);
    let [isInformationFormShown , setIsInformationFormShown] = useState(false);
    let [isPreferencesModalShown , setIsPreferencesModalShown] = useState(false);
    let [isPlotsSearchShown , setIsPlotsSearchShown] = useState(false);
    let [isOwnersSearchShown , setIsOwnersSearchShown] = useState(false);
    let [isCoownershipSearchShown , setIsCoownershipSearchShown] = useState(false);
    let [isPlotSelectionShown , setIsPlotSelectionShown] = useState(false);

    let [activeToolbar, setActiveToolbar] = useState("");
    let [activeSelectionTab, setActiveSelectionTab] = useState(0);
    let [plotSelectionData, setPlotSelectionData] = useState([]);


    // fix this
    let f = ()=> {
        setIsShown(true);
    }


    document.addEventListener("open-cadastrapp", f)


    const handlePlotsZoom = () => {
        alert("Plot selection zoom is clicked");
    }

    const handlePlotsClear = () => {
        setPlotSelectionData([]);
    }

    const handleRequestFormClose = ()=> {
        setIsRequestFormShown(false);
    }

    const handleInformationFormClose = () => {
        setIsInformationFormShown(false);
    }

    const handlePreferencesModalClose = () => {
        setIsPreferencesModalShown(false);
    }

    const handleInformationFormOpen = (plotData) => {
        setIsInformationFormShown(true);
    }

    const handlePlotsSearch = (searchParameters) => {
        alert("Plot search is executed, random data is appended to plots selection");
        let selectionData = plotSelectionData.slice();
        selectionData.push([randomPlot()]);
        setPlotSelectionData(selectionData);
        setActiveSelectionTab(selectionData.length - 1);
    }

    const handleOwnersSearch = (searchParameters) => {
        alert("Owner search is executed");
        // let selectionData = plotSelectionData.slice();
        // selectionData.push(randomPlot());
        // setPlotSelectionData(selectionData);
    }

    const handleCoownershipSearch = (searchParameters) => {
        alert("Coownership search is executed");
        // let selectionData = plotSelectionData.slice();
        // selectionData.push(randomPlot());
        // setPlotSelectionData(selectionData);
    }

    const handleToolbarClick = (action) => {

        let url;
        let selectionData = plotSelectionData.slice();
        switch(action) {

        case "select-by-point":
            console.log(selectionData);
            console.log(selectionData.length);
            alert("You selected a plot by a point tool. Adding (1) random to plot data to 'Plots Selection' section");
            if (selectionData.length == 0)
                selectionData = [[]];
            selectionData[activeSelectionTab].push(randomPlot());
            setPlotSelectionData(selectionData);
        break;

        case "select-by-linestring":
            if (selectionData.length == 0)
                selectionData = [[]];

            alert("You selected a plot by a linestring tool. Adding (2) random to plot data to 'Plots Selection' section");
            selectionData[activeSelectionTab].push(randomPlot());
            selectionData[activeSelectionTab].push(randomPlot());
            setPlotSelectionData(selectionData);
        break;

        case "select-by-polygon":
            if (selectionData.length == 0)
                selectionData = [[]];

            alert("You selected a plot by a polygon tool. Adding (3) random to plot data to 'Plots Selection' section");
            selectionData[activeSelectionTab].push(randomPlot());
            selectionData[activeSelectionTab].push(randomPlot());
            selectionData[activeSelectionTab].push(randomPlot());
            setPlotSelectionData(selectionData);
        break;

        case "unit-de-fonc":
            alert("You clicked on unit-de-fonc button, you will redirecting an external service in a new tab");
            url = "https://portail.sig.rennesmetropole.fr/mapfishapp/ws/addons/cadastrapp/html/ficheUniteFonciere.html";
            window.open(url, '_blank');
        break;

        case "search-plots":
            setActiveToolbar("search-plots");
            setIsPlotsSearchShown(true);
            setIsOwnersSearchShown(false);
            setIsCoownershipSearchShown(false);
        break;

        case "search-owners":
            setActiveToolbar("search-owners");
            setIsOwnersSearchShown(true);
            setIsPlotsSearchShown(false);
            setIsCoownershipSearchShown(false);
        break;

        case "coownership":
            setActiveToolbar("coownership");
            setIsCoownershipSearchShown(true);
            setIsPlotsSearchShown(false);
            setIsOwnersSearchShown(false);
        break;

        case "request-form":
            // setActiveToolbar("");
            setIsRequestFormShown(true);
        break;

        case "preferences":
            // setActiveToolbar("");
            setIsPreferencesModalShown(true);
        break;

        case "help":
            url = "https://portail.sig.rennesmetropole.fr/actus/aide/cadastre";
            window.open(url, '_blank');
        break;

        }
        console.log(action);
    }

    const handlePlotsSelectionClick = (action) => {
        console.log(action);
        switch(action) {
        case "information-form":
            setIsInformationFormShown(true);
        break;
        case "export":
            alert("Selection export is clicked");
        break;
        case "zoom":
            alert("Selection zoom is clicked");
        break;
        case "landry":
            alert("You clicked on landry information button, you will redirecting an external service in a new tab");
            let url = "https://portail.sig.rennesmetropole.fr/mapfishapp/ws/addons/cadastrapp/html/ficheUniteFonciere.html";
            window.open(url, '_blank');
        break;
        }
    }

    const handlePlotsSelectionDeleteTab = (index) => {
        let selectionData = plotSelectionData.slice();
        selectionData.splice(index, 1);
        setPlotSelectionData(selectionData);
        let active = selectionData.length - 1;
        active = active < 0 ? 0 : active;
        setActiveSelectionTab(active);
    }

    const handlePlotsSelectionNewTab = () => {
        let selectionData = plotSelectionData.slice();
        selectionData.push([[]]);
        setPlotSelectionData(selectionData);
        setActiveSelectionTab(selectionData.length - 1);
    }

    const handlePlotsSelectionTabChange = (tabIndex)=> {
        setActiveSelectionTab(tabIndex);
    }

    const handlePluginClose = () => {
        setIsShown(false);
    }

    let className = isShown ? "cadastrapp-mockup" : "collapse";
    return (
        <div className={className}>
            <MainToolbar
                onClick={handleToolbarClick}
                selected={activeToolbar}
            ></MainToolbar>
            <div className="top">
                <h4>Cadastrapp</h4>
                <Button
                    onClick={handlePluginClose}
                    bsStyle="primary"
                    className="square-button ms-close pull-right">
                    <span className="glyphicon glyphicon-1-close"></span>
                </Button>
            </div>
            <div className="right-side pull-left">
                <PlotsSearch
                    isShown={isPlotsSearchShown}
                    onSearch={handlePlotsSearch}
                ></PlotsSearch>
                <OwnersSearch
                    isShown={isOwnersSearchShown}
                    onSearch={handleOwnersSearch}
                ></OwnersSearch>
                <CoownershipSearch
                    isShown={isCoownershipSearchShown}
                    onSearch={handleCoownershipSearch}
                ></CoownershipSearch>
                <PlotsSelection
                    isShown={isPlotSelectionShown}
                    onInformationForm={handleInformationFormOpen}
                    onZoom={handlePlotsZoom}
                    onClear={handlePlotsClear}
                    onClick={handlePlotsSelectionClick}
                    onTabDelete={handlePlotsSelectionDeleteTab}
                    onTabChange={handlePlotsSelectionTabChange}
                    onNewTab={handlePlotsSelectionNewTab}
                    data={plotSelectionData}
                    active={activeSelectionTab}
                ></PlotsSelection>
                <RequestFormModal
                    isShown={isRequestFormShown}
                    onClose={handleRequestFormClose}
                ></RequestFormModal>
                <InformationFormModal
                    isShown={isInformationFormShown}
                    onClose={handleInformationFormClose}
                ></InformationFormModal>
                <PreferencesModal
                    isShown={isPreferencesModalShown}
                    onClose={handlePreferencesModalClose}
                ></PreferencesModal>
            </div>
        </div>
    );
}

export default createPlugin('CadastrappMockup', {
    component: CadastrappMockup,
    containers: {
        BurgerMenu:{
            name: 'cadastrapp',
            position: 1050,
            text: "CADASTRAPP",
            icon: <Glyphicon glyph="th"/>,
            action: () => {
                // fix this later
                document.dispatchEvent(new Event("open-cadastrapp"));
                return toggleControl('cadastrapp', 'enabled');
            },
            selector: (state, ownProps) => {
            },
            priority: 2,
            doNotHide: true
        }
    }
});
