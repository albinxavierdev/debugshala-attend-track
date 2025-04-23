
import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description?: string;
  onAddNew?: () => void;
  addNewText?: string;
}

export const PageHeader = ({
  title,
  description,
  onAddNew,
  addNewText = 'Add New'
}: PageHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
      </div>
      {onAddNew && (
        <div className="mt-4 sm:mt-0">
          <Button onClick={onAddNew} className="bg-debugshala-600 hover:bg-debugshala-700">
            <PlusCircle className="mr-2 h-4 w-4" />
            {addNewText}
          </Button>
        </div>
      )}
    </div>
  );
};
