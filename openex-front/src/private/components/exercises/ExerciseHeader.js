import React, { useState, useRef } from 'react';
import * as R from 'ramda';
import { makeStyles } from '@mui/styles';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import { AddOutlined } from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { Form } from 'react-final-form';
import { useParams } from 'react-router-dom';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import { updateExerciseTags } from '../../../actions/Exercise';
import TagField from '../../../components/TagField';
import ExercisePopover from './ExercisePopover';
import { useHelper } from '../../../store';
import { useFormatter } from '../../../components/i18n';
import { Transition } from '../../../utils/Environment';
import { isExerciseReadOnly } from '../../../utils/Exercise';

const useStyles = makeStyles(() => ({
  container: {
    width: '100%',
  },
  title: {
    float: 'left',
    textTransform: 'uppercase',
  },
  tags: {
    marginTop: -4,
    float: 'right',
  },
  tag: {
    marginLeft: 5,
  },
  tagsInput: {
    width: 300,
    margin: '0 10px 0 10px',
    float: 'right',
  },
}));

const TagChip = ({ tagId, isReadOnly, deleteTag }) => {
  const classes = useStyles();
  const tag = useHelper((helper) => helper.getTag(tagId));
  return tag ? (
    <Chip
      key={tag.tag_id}
      classes={{ root: classes.tag }}
      label={tag.tag_name}
      onDelete={isReadOnly ? null : () => deleteTag(tag.tag_id)}
    />
  ) : (
    <div />
  );
};

const ExerciseHeader = () => {
  const classes = useStyles();
  const { t } = useFormatter();
  const { exerciseId } = useParams();
  const dispatch = useDispatch();
  const { exercise, tagsMap } = useHelper((helper) => {
    return {
      exercise: helper.getExercise(exerciseId),
      tagsMap: helper.getTagsMap(),
    };
  });
  const [openTagAdd, setOpenTagAdd] = useState(false);
  const containerRef = useRef(null);
  const handleToggleAddTag = () => setOpenTagAdd(!openTagAdd);

  const deleteTag = (tagId) => {
    const tagIds = exercise.exercise_tags.filter((id) => id !== tagId);
    dispatch(
      updateExerciseTags(exercise.exercise_id, {
        exercise_tags: tagIds,
      }),
    );
  };
  const submitTags = (values) => {
    handleToggleAddTag();
    dispatch(
      updateExerciseTags(exercise.exercise_id, {
        exercise_tags: R.uniq([
          ...values.exercise_tags.map((tag) => tag.id),
          ...exercise.exercise_tags,
        ]),
      }),
    );
  };
  const { exercise_tags: tags } = exercise;
  return (
    <div className={classes.container} ref={containerRef}>
      <Typography
        variant="h1"
        gutterBottom={true}
        classes={{ root: classes.title }}
      >
        {exercise.exercise_name}
      </Typography>
      <ExercisePopover exercise={exercise} tagsMap={tagsMap} />
      <div className={classes.tags}>
        {R.take(5, tags ?? []).map((tag) => (
          <TagChip
            key={tag}
            tagId={tag}
            isReadOnly={isExerciseReadOnly(exercise, true)}
            deleteTag={deleteTag}
          />
        ))}
        <div style={{ float: 'left', marginTop: -5 }}>
          <IconButton
            style={{ float: 'left' }}
            color="primary"
            aria-label="Tag"
            onClick={handleToggleAddTag}
            disabled={isExerciseReadOnly(exercise, true)}
          >
            {<AddOutlined />}
          </IconButton>
        </div>
        <Dialog
          TransitionComponent={Transition}
          open={openTagAdd}
          onClose={handleToggleAddTag}
          fullWidth={true}
          maxWidth="xs"
          PaperProps={{ elevation: 1 }}
        >
          <DialogTitle>{t('Add tags to this exercise')}</DialogTitle>
          <DialogContent>
            <Form
              keepDirtyOnReinitialize={true}
              initialValues={{ exercise_tags: [] }}
              onSubmit={submitTags}
              mutators={{
                setValue: ([field, value], state, { changeValue }) => {
                  changeValue(state, field, () => value);
                },
              }}
            >
              {({ handleSubmit, values, submitting, pristine }) => (
                <form id="tagsForm" onSubmit={handleSubmit}>
                  <TagField
                    name="exercise_tags"
                    values={values}
                    label={null}
                    placeholder={t('Tags')}
                  />
                  <div style={{ float: 'right', marginTop: 20 }}>
                    <Button
                      onClick={handleToggleAddTag}
                      disabled={submitting}
                      style={{ marginRight: 10 }}
                    >
                      {t('Cancel')}
                    </Button>
                    <Button
                      color="secondary"
                      type="submit"
                      disabled={pristine || submitting}
                    >
                      {t('Add')}
                    </Button>
                  </div>
                </form>
              )}
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ExerciseHeader;
