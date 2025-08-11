import MedicalHistory from '../../components/MedicalHistory';

export default async function Page({ params }: { params: { patientId: string } }) {
  const { patientId } = params;

  // In future you can fetch data here too, for now just pass patientId
  return <MedicalHistory patientId={patientId} />;
}
