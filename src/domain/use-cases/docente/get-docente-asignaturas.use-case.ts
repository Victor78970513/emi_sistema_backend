import { DocenteRepository } from "../../repositories/docente.repository";
import { AsignaturaEntity } from "../../entities/docente.entity";

interface GetDocenteAsignaturasUseCase {
    execute(docente_id: number): Promise<{ [carrera: string]: AsignaturaEntity[] }>;
}

export class GetDocenteAsignaturas implements GetDocenteAsignaturasUseCase {
    constructor(
        private readonly docenteRepository: DocenteRepository,
    ) {}

    async execute(docente_id: number): Promise<{ [carrera: string]: AsignaturaEntity[] }> {
        // Primero obtener las carreras del docente
        const docenteCarreras = await this.docenteRepository.getDocenteCarreras(docente_id);
        
        if (docenteCarreras.length === 0) {
            return {};
        }

        // Extraer los IDs de las carreras
        const carreraIds = docenteCarreras.map(dc => dc.carrera_id);
        
        // Obtener todas las asignaturas de esas carreras
        const asignaturas = await this.docenteRepository.getAsignaturasByCarreras(carreraIds);
        
        // Agrupar las asignaturas por carrera
        const asignaturasPorCarrera: { [carrera: string]: AsignaturaEntity[] } = {};
        
        asignaturas.forEach(asignatura => {
            const carreraNombre = asignatura.carrera_nombre || `Carrera ${asignatura.carrera_id}`;
            
            if (!asignaturasPorCarrera[carreraNombre]) {
                asignaturasPorCarrera[carreraNombre] = [];
            }
            
            asignaturasPorCarrera[carreraNombre].push(asignatura);
        });
        
        return asignaturasPorCarrera;
    }
} 