# Specialized AI agents
from app.agents.base import SpecialistAgent


class CardiologyAgent(SpecialistAgent):
    name = "Cardiology Agent"
    specialty = "cardiology"


class NeurologyAgent(SpecialistAgent):
    name = "Neurology Agent"
    specialty = "neurology"


class InfectiousDiseaseAgent(SpecialistAgent):
    name = "Infectious Disease Agent"
    specialty = "infectious disease"


class GeneralMedicineAgent(SpecialistAgent):
    name = "General Medicine Agent"
    specialty = "general medicine"


ALL_AGENTS = [
    CardiologyAgent(),
    NeurologyAgent(),
    InfectiousDiseaseAgent(),
    GeneralMedicineAgent(),
]