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
         Nav, NavItem } from "react-bootstrap";

import Modal from "../components/misc/Modal";
import { createPlugin } from '../utils/PluginsUtils';

function randomString(length) {
    let s = "";
    for (let i=0;i<length;i++)
        s += String.fromCharCode(97 + randomInt(26));
    return s;
}

function randomInt(max) {
    return Math.floor(Math.random() * max);
}

function randomPlot() {
    let d = [
        randomString(2),
        randomString(3),
        randomString(9),
        randomString(9),
        randomString(5)
    ]
    return d;
}

function MainToolbar(props) {
    // following array values are
    // 0: glyphicon
    // 1: action name
    // 2: tooltip text
    let toolbarOptions = [
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
                        className="square-button">
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

function PlotSelectionTabs(props) {
    return (
        <Tabs
            onSelect={props.onTabChange}
            activeKey={props.active}
            defaultActiveKey={props.active}>
            {props.data.map((value, index)=>(
                <Tab eventKey={index} title={"Selection " + (index+1).toString()}>
                    <PlotsSelectionTable data={value}></PlotsSelectionTable>
                </Tab>
            ))}
        </Tabs>
    )
}

function PlotSelectionTabsWithDropdown(props) {
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
                        <NavDropdown title="Other Selections">
                        {props.data.slice(2).map((value, index)=>(
                            <MenuItem eventKey={index+2}>
                                {"Selection " + (index+2+1).toString()}
                            </MenuItem>
                        ))}
                        </NavDropdown>

                    </Nav>
                </Col>
                <Col sm={12}>
                    <Tab.Content animation>
                    <Tab.Pane eventKey={0}>
                        <PlotsSelectionTable data={props.data[0]}></PlotsSelectionTable>
                    </Tab.Pane>
                    <Tab.Pane eventKey={1}>
                        <PlotsSelectionTable data={props.data[1]}></PlotsSelectionTable>
                    </Tab.Pane>
                        {props.data.slice(2).map((value, index)=>(
                            <Tab.Pane eventKey={index+2}>
                                <PlotsSelectionTable data={props.data[index+2]}></PlotsSelectionTable>
                            </Tab.Pane>
                        ))}
                    </Tab.Content>
                </Col>
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
                    <ControlLabel>Road Number</ControlLabel>
                </div>
                <div className="form-col">
                    <FormControl type="text" bsSize="sm"></FormControl>
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


function SampleTab() {


    return (
        <Tab.Container id="tabs-with-dropdown" defaultActiveKey="first">
        <Row className="clearfix">
        <Col sm={12}>
            <Nav bsStyle="tabs">
                <NavItem eventKey="first">
                    Tab 1
                </NavItem>
                <NavItem eventKey="second">
                    Tab 2
                </NavItem>
                <NavDropdown eventKey="3" title="Dropdown" id="nav-dropdown-within-tab">
                    <MenuItem eventKey="3.1">Action</MenuItem>
                    <MenuItem eventKey="3.2">Another action</MenuItem>
                    <MenuItem eventKey="3.3">Something else here</MenuItem>
                </NavDropdown>
            </Nav>
        </Col>
        <Col sm={12}>
            <Tab.Content animation>
            <Tab.Pane eventKey="first">
                Tab 1 content
            </Tab.Pane>
            <Tab.Pane eventKey="second">
                Tab 2 content
            </Tab.Pane>
            <Tab.Pane eventKey="3.1">
                Tab 3.1 content
            </Tab.Pane>
            <Tab.Pane eventKey="3.2">
                Tab 3.2 content
            </Tab.Pane>
            <Tab.Pane eventKey="3.3">
                Tab 3.3 content
            </Tab.Pane>
            <Tab.Pane eventKey="3.4">
                Tab 3.4 content
            </Tab.Pane>
            </Tab.Content>
        </Col>
        </Row>
    </Tab.Container>
    )
}

function CadastrappMockup() {

    let [isShown , setIsShown] = useState(true);
    let [isRequestFormShown , setIsRequestFormShown] = useState(false);
    let [isInformationFormShown , setIsInformationFormShown] = useState(false);
    let [isPreferencesModalShown , setIsPreferencesModalShown] = useState(false);
    let [isPlotsSearchShown , setIsPlotsSearchShown] = useState(false);
    let [isOwnersSearchShown , setIsOwnersSearchShown] = useState(false);
    let [isCoownershipSearchShown , setIsCoownershipSearchShown] = useState(false);
    let [isPlotSelectionShown , setIsPlotSelectionShown] = useState(false);

    let [activeSelectionTab, setActiveSelectionTab] = useState(0);
    let [plotSelectionData, setPlotSelectionData] = useState([[randomPlot(),randomPlot()]]);




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
        console.log(selectionData.length - 1);
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
            alert("You selected a plot by a point tool. Adding (1) random to plot data to 'Plots Selection' section");
            selectionData[activeSelectionTab].push(randomPlot());
            setPlotSelectionData(selectionData);
        break;

        case "select-by-linestring":
            alert("You selected a plot by a linestring tool. Adding (2) random to plot data to 'Plots Selection' section");
            selectionData[activeSelectionTab].push(randomPlot());
            selectionData[activeSelectionTab].push(randomPlot());
            setPlotSelectionData(selectionData);
        break;

        case "select-by-polygon":
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
            setIsPlotsSearchShown(true);
            setIsOwnersSearchShown(false);
            setIsCoownershipSearchShown(false);
        break;

        case "search-owners":
            setIsOwnersSearchShown(true);
            setIsPlotsSearchShown(false);
            setIsCoownershipSearchShown(false);
        break;

        case "coownership":
            setIsCoownershipSearchShown(true);
            setIsPlotsSearchShown(false);
            setIsOwnersSearchShown(false);
        break;

        case "request-form":
            setIsRequestFormShown(true);
        break;

        case "preferences":
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

    const handlePlotsSelectionTabChange = (tabIndex)=>
    {
        console.log("tab index" + tabIndex);
        setActiveSelectionTab(tabIndex);
    }

    const handlePluginClose = () => {
        setIsShown(false);
    }

    let className = isShown ? "cadastrapp-mockup" : "collapse";
    return (
        <div className={className}>
            <MainToolbar onClick={handleToolbarClick}></MainToolbar>
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
                    onTabChange={handlePlotsSelectionTabChange}
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
    component: CadastrappMockup
});
