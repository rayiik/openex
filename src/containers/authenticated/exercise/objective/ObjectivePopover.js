import React, {PropTypes, Component} from 'react';
import {connect} from 'react-redux';
import * as Constants from '../../../../constants/ComponentTypes'
import {Popover} from '../../../../components/Popover';
import {Menu} from '../../../../components/Menu'
import {Dialog} from '../../../../components/Dialog'
import {IconButton, FlatButton} from '../../../../components/Button'
import {Icon} from '../../../../components/Icon'
import {MenuItemLink, MenuItemButton} from "../../../../components/menu/MenuItem"
import {updateObjective, deleteObjective} from '../../../../actions/Objective'
import {addSubobjective} from '../../../../actions/Subobjective'
import ObjectiveForm from './ObjectiveForm'
import SubobjectiveForm from './SubobjectiveForm'

const style = {
  position: 'absolute',
  top: '10px',
  right: 0,
}

class ObjectivePopover extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openDelete: false,
      openEdit: false,
      openPopover: false,
      openCreateSubobjective: false
    }
  }

  handlePopoverOpen(event) {
    event.preventDefault()
    this.setState({
      openPopover: true,
      anchorEl: event.currentTarget,
    })
  }

  handlePopoverClose() {
    this.setState({openPopover: false})
  }

  handleOpenEdit() {
    this.setState({
      openEdit: true
    })
    this.handlePopoverClose()
  }

  handleCloseEdit() {
    this.setState({
      openEdit: false
    })
  }

  onSubmitEdit(data) {
    return this.props.updateObjective(this.props.exerciseId, this.props.objectiveId, data)
  }

  submitFormEdit() {
    this.refs.objectiveForm.submit()
  }

  handleOpenDelete() {
    this.setState({
      openDelete: true
    })
    this.handlePopoverClose()
  }

  handleCloseDelete() {
    this.setState({
      openDelete: false
    })
  }

  submitDelete() {
    this.props.deleteObjective(this.props.exerciseId, this.props.objectiveId)
    this.handleCloseDelete()
  }

  handleOpenCreateSubobjective() {
    this.setState({openCreateSubobjective: true})
  }

  handleCloseCreateSubobjective() {
    this.setState({openCreateSubobjective: false})
  }

  onSubmitCreateSubobjective(data) {
    return this.props.addSubobjective(this.props.exerciseId, this.props.objectiveId, data)
  }

  submitFormCreateSubobjective() {
    this.refs.subobjectiveForm.submit()
  }

  render() {
    const editActions = [
      <FlatButton
        label="Cancel"
        primary={true}
        onTouchTap={this.handleCloseEdit.bind(this)}
      />,
      <FlatButton
        label="Update"
        primary={true}
        onTouchTap={this.submitFormEdit.bind(this)}
      />,
    ]
    const deleteActions = [
      <FlatButton
        label="Cancel"
        primary={true}
        onTouchTap={this.handleCloseDelete.bind(this)}
      />,
      <FlatButton
        label="Delete"
        primary={true}
        onTouchTap={this.submitDelete.bind(this)}
      />,
    ]
    const createSubobjectiveActions = [
      <FlatButton
        label="Cancel"
        primary={true}
        onTouchTap={this.handleCloseCreateSubobjective.bind(this)}
      />,
      <FlatButton
        label="Create"
        primary={true}
        onTouchTap={this.submitFormCreateSubobjective.bind(this)}
      />,
    ]

    let initialInformation = undefined
    if (this.props.objective) {
      initialInformation = {
        objective_title: this.props.objective.get('objective_title'),
        objective_description: this.props.objective.get('objective_description'),
        objective_priority: this.props.objective.get('objective_priority')
      }
    }

    return (
      <div style={style}>
        <IconButton onClick={this.handlePopoverOpen.bind(this)}>
          <Icon name={Constants.ICON_NAME_NAVIGATION_MORE_VERT}/>
        </IconButton>
        <Popover open={this.state.openPopover}
                 anchorEl={this.state.anchorEl}
                 onRequestClose={this.handlePopoverClose.bind(this)}>
          <Menu multiple={false}>
            <MenuItemLink label="Add a new subobjective" onTouchTap={this.handleOpenCreateSubobjective.bind(this)}/>
            <MenuItemLink label="Edit" onTouchTap={this.handleOpenEdit.bind(this)}/>
            <MenuItemButton label="Delete" onTouchTap={this.handleOpenDelete.bind(this)}/>
          </Menu>
        </Popover>
        <Dialog
          title="Confirmation"
          modal={false}
          open={this.state.openDelete}
          onRequestClose={this.handleCloseDelete.bind(this)}
          actions={deleteActions}
        >
          Do you confirm the deletion of this objective?
        </Dialog>
        <Dialog
          title="Update the objective"
          modal={false}
          open={this.state.openEdit}
          onRequestClose={this.handleCloseEdit.bind(this)}
          actions={editActions}
        >
          <ObjectiveForm ref="objectiveForm" initialValues={initialInformation} onSubmit={this.onSubmitEdit.bind(this)} onSubmitSuccess={this.handleCloseEdit.bind(this)}/>
        </Dialog>
        <Dialog
          title="Create a new subobjective"
          modal={false}
          open={this.state.openCreateSubobjective}
          onRequestClose={this.handleCloseCreateSubobjective.bind(this)}
          actions={createSubobjectiveActions}
        >
          <SubobjectiveForm ref="subobjectiveForm" onSubmit={this.onSubmitCreateSubobjective.bind(this)} onSubmitSuccess={this.handleCloseCreateSubobjective.bind(this)}/>
        </Dialog>
      </div>
    )
  }
}

const select = (state, props) => {
  let objectives = state.application.getIn(['entities', 'objectives'])
  let objective = objectives.get(props.objectiveId)

  return {
    objective
  }
}

ObjectivePopover.propTypes = {
  exerciseId: PropTypes.string,
  objectiveId: PropTypes.string,
  deleteObjective: PropTypes.func,
  updateObjective: PropTypes.func,
  addSubobjective: PropTypes.func,
  objective: PropTypes.object,
  children: PropTypes.node
}

export default connect(select, {updateObjective, deleteObjective, addSubobjective})(ObjectivePopover)