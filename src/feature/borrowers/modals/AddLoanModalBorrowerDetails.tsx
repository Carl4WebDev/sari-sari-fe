import AddLoanModal from "../../dashboard/modals/AddLoanModal";

interface Props {
  isOpen: boolean;
  isClose: () => void;
  borrowerId: number;
  borrowerName: string;
  profileImageUrl?: string;
  onLoanCreated?: (totalAmount: number) => Promise<void> | void;
}

/**
 * AddLoanModalBorrowerDetails
 * 
 * Delegator wrapper around the consolidated AddLoanModal.
 * Keeps backwards compatibility with BorrowerDetailsPage while maintaining Single Responsibility & DRY.
 */
export default function AddLoanModalBorrowerDetails({
  isOpen,
  isClose,
  borrowerId,
  borrowerName,
  profileImageUrl,
  onLoanCreated,
}: Props) {
  return (
    <AddLoanModal
      isOpen={isOpen}
      isClose={isClose}
      borrowerId={borrowerId}
      borrowerName={borrowerName}
      profileImageUrl={profileImageUrl}
      onLoanCreated={onLoanCreated}
      mode="full"
    />
  );
}