<?php

namespace APIBundle\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity()
 * @ORM\Table(name="incidents")
 */
class Incident
{
    /**
     * @ORM\Id
     * @ORM\Column(type="string")
     * @ORM\GeneratedValue(strategy="UUID")
     */
    protected $incident_id;

    /**
     * @ORM\Column(type="string")
     */
    protected $incident_title;

    /**
     * @ORM\Column(type="text")
     */
    protected $incident_story;

    /**
     * @ORM\ManyToOne(targetEntity="IncidentType", inversedBy="type_incidents")
     * @ORM\JoinColumn(name="incident_type", referencedColumnName="type_id", onDelete="CASCADE")
     * @var IncidentType
     */
    protected $incident_type;

    /**
     * @ORM\ManyToOne(targetEntity="Event", inversedBy="event_incidents")
     * @ORM\JoinColumn(name="incident_event", referencedColumnName="event_id", onDelete="CASCADE")
     * @var Event
     */
    protected $incident_event;

    /**
     * @ORM\ManyToMany(targetEntity="Objective", inversedBy="incident_objectives")
     * @ORM\JoinTable(name="incidents_objectives",
     *      joinColumns={@ORM\JoinColumn(name="incident_id", referencedColumnName="incident_id", onDelete="CASCADE")},
     *      inverseJoinColumns={@ORM\JoinColumn(name="objective_id", referencedColumnName="objective_id", onDelete="RESTRICT")}
     *      )
     * @var Objective[]
     */
    protected $incident_objectives;

    /**
     * @ORM\OneToMany(targetEntity="Outcome", mappedBy="outcome_incident")
     * @var Outcome[]
     */
    protected $incident_outcomes;

    /**
     * @ORM\OneToMany(targetEntity="Inject", mappedBy="inject_incident")
     * @var Inject[]
     */
    protected $incident_injects;

    public function __construct()
    {
        $this->incident_objectives = new ArrayCollection();
        $this->incident_outcomes = new ArrayCollection();
        $this->incident_injects = new ArrayCollection();
    }

    public function getIncidentId()
    {
        return $this->incident_id;
    }

    public function setIncidentId($id)
    {
        $this->incident_id = $id;
        return $this;
    }

    public function getIncidentTitle()
    {
        return $this->incident_title;
    }

    public function setIncidentTitle($title)
    {
        $this->incident_title = $title;
        return $this;
    }

    public function getIncidentStory()
    {
        return $this->incident_story;
    }

    public function setIncidentStory($story)
    {
        $this->incident_story = $story;
        return $this;
    }

    public function getIncidentType()
    {
        return $this->incident_type;
    }

    public function setIncidentType($type)
    {
        $this->incident_type = $type;
        return $this;
    }

    public function getIncidentEvent()
    {
        return $this->incident_event;
    }

    public function setIncidentEvent($event)
    {
        $this->incident_event = $event;
        return $this;
    }

    public function getIncidentObjectives()
    {
        return $this->incident_objectives;
    }

    public function setIncidentObjectives($objectives)
    {
        $this->incident_objectives = $objectives;
        return $this;
    }

    public function getIncidentOutcomes()
    {
        return $this->incident_outcomes;
    }

    public function setIncidentOutcomes($outcomes)
    {
        $this->incident_outcomes = $outcomes;
        return $this;
    }

    public function getIncidentInjects()
    {
        return $this->incident_injects;
    }

    public function setIncidentInjects($injects)
    {
        $this->incident_injects = $injects;
        return $this;
    }
}