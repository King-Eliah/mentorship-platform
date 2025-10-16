import React, { useState, useEffect } from 'react';
import { Upload, FileSpreadsheet, Users, UserCheck, AlertCircle, CheckCircle2, Shuffle } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';

interface UploadResult {
  success: boolean;
  message: string;
  processedCount?: number;
  error?: string;
}

interface PairingResult {
  success: boolean;
  message: string;
  pairsCreated?: number;
  unmatchedMentees?: number;
  error?: string;
}

interface PairingStatistics {
  totalMentors: number;
  totalMentees: number;
  totalMatches: number;
  activeMatches: number;
  pendingMatches: number;
  unmatchedMentees: number;
}

export const ExcelUploadSection: React.FC = () => {
  const [mentorFile, setMentorFile] = useState<File | null>(null);
  const [menteeFile, setMenteeFile] = useState<File | null>(null);
  const [mentorUploading, setMentorUploading] = useState(false);
  const [menteeUploading, setMenteeUploading] = useState(false);
  const [mentorResult, setMentorResult] = useState<UploadResult | null>(null);
  const [menteeResult, setMenteeResult] = useState<UploadResult | null>(null);
  
  // Pairing state
  const [pairingInProgress, setPairingInProgress] = useState(false);
  const [pairingResult, setPairingResult] = useState<PairingResult | null>(null);
  const [statistics, setStatistics] = useState<PairingStatistics | null>(null);
  
  // Load statistics on component mount
  useEffect(() => {
    loadPairingStatistics();
  }, []);

  const loadPairingStatistics = async () => {
    try {
      const response = await fetch('/api/admin/pairing-statistics', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const result = await response.json();
      if (result.success) {
        setStatistics(result.statistics);
      }
    } catch (error) {
      console.error('Error loading pairing statistics:', error);
    }
  };

  const handleMentorFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMentorFile(file);
      setMentorResult(null);
    }
  };

  const handleMenteeFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMenteeFile(file);
      setMenteeResult(null);
    }
  };

  const uploadMentors = async () => {
    if (!mentorFile) return;

    setMentorUploading(true);
    setMentorResult(null);

    const formData = new FormData();
    formData.append('file', mentorFile);

    try {
      const response = await fetch('/api/admin/upload-mentors', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const result = await response.json();
      setMentorResult(result);

      if (result.success) {
        setMentorFile(null);
        // Reset file input
        const input = document.getElementById('mentor-file-input') as HTMLInputElement;
        if (input) input.value = '';
        // Refresh statistics after successful upload
        loadPairingStatistics();
      }
    } catch {
      setMentorResult({
        success: false,
        message: '',
        error: 'Network error occurred while uploading mentors file'
      });
    } finally {
      setMentorUploading(false);
    }
  };

  const uploadMentees = async () => {
    if (!menteeFile) return;

    setMenteeUploading(true);
    setMenteeResult(null);

    const formData = new FormData();
    formData.append('file', menteeFile);

    try {
      const response = await fetch('/api/admin/upload-mentees', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const result = await response.json();
      setMenteeResult(result);

      if (result.success) {
        setMenteeFile(null);
        // Reset file input
        const input = document.getElementById('mentee-file-input') as HTMLInputElement;
        if (input) input.value = '';
        // Refresh statistics after successful upload
        loadPairingStatistics();
      }
    } catch {
      setMenteeResult({
        success: false,
        message: '',
        error: 'Network error occurred while uploading mentees file'
      });
    } finally {
      setMenteeUploading(false);
    }
  };

  const performAutomaticPairing = async () => {
    setPairingInProgress(true);
    setPairingResult(null);

    try {
      const response = await fetch('/api/admin/perform-pairing', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      setPairingResult(result);
      
      if (result.success) {
        // Refresh statistics after successful pairing
        loadPairingStatistics();
      }
    } catch {
      setPairingResult({
        success: false,
        message: '',
        error: 'Network error occurred while performing pairing'
      });
    } finally {
      setPairingInProgress(false);
    }
  };

  const ResultMessage: React.FC<{ result: UploadResult | null }> = ({ result }) => {
    if (!result) return null;

    return (
      <div className={`mt-3 p-3 rounded-lg flex items-center space-x-2 ${
        result.success 
          ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
          : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
      }`}>
        {result.success ? (
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
        ) : (
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
        )}
        <div>
          <p className="font-medium">
            {result.success ? result.message : 'Upload Failed'}
          </p>
          {result.processedCount !== undefined && (
            <p className="text-sm opacity-90">
              Successfully processed {result.processedCount} records
            </p>
          )}
          {result.error && (
            <p className="text-sm opacity-90">{result.error}</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <Upload className="w-5 h-5 text-primary-600" />
          <h3 className="font-semibold text-lg">Excel File Upload</h3>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Mentors Upload */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 pb-2 border-b">
              <UserCheck className="w-5 h-5 text-blue-600" />
              <h4 className="font-medium text-gray-900 dark:text-gray-100">Upload Mentors</h4>
            </div>
            
            <div className="space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Upload an Excel file (.xlsx) with mentor data. Expected columns:
              </p>
              <div className="text-xs bg-gray-50 dark:bg-gray-800 p-3 rounded border">
                <strong>Columns:</strong> FirstName, LastName, Email, Skills, Experience, Bio
              </div>
              
              <div className="space-y-2">
                <label htmlFor="mentor-file-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Choose Excel File
                </label>
                <input
                  id="mentor-file-input"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleMentorFileChange}
                  className="block w-full text-sm text-gray-500 dark:text-gray-400
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-lg file:border-0
                    file:text-sm file:font-medium
                    file:bg-primary-50 file:text-primary-700
                    dark:file:bg-primary-900/20 dark:file:text-primary-300
                    hover:file:bg-primary-100 dark:hover:file:bg-primary-900/30
                    file:cursor-pointer cursor-pointer"
                />
              </div>
              
              {mentorFile && (
                <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-blue-700 dark:text-blue-300">{mentorFile.name}</span>
                  </div>
                  <Button
                    onClick={uploadMentors}
                    disabled={mentorUploading}
                    className="px-4 py-2"
                  >
                    {mentorUploading ? 'Uploading...' : 'Upload Mentors'}
                  </Button>
                </div>
              )}
              
              <ResultMessage result={mentorResult} />
            </div>
          </div>

          {/* Mentees Upload */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 pb-2 border-b">
              <Users className="w-5 h-5 text-green-600" />
              <h4 className="font-medium text-gray-900 dark:text-gray-100">Upload Mentees</h4>
            </div>
            
            <div className="space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Upload an Excel file (.xlsx) with mentee data. Expected columns:
              </p>
              <div className="text-xs bg-gray-50 dark:bg-gray-800 p-3 rounded border">
                <strong>Columns:</strong> FirstName, LastName, Email, Skills, Experience, Bio
              </div>
              
              <div className="space-y-2">
                <label htmlFor="mentee-file-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Choose Excel File
                </label>
                <input
                  id="mentee-file-input"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleMenteeFileChange}
                  className="block w-full text-sm text-gray-500 dark:text-gray-400
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-lg file:border-0
                    file:text-sm file:font-medium
                    file:bg-primary-50 file:text-primary-700
                    dark:file:bg-primary-900/20 dark:file:text-primary-300
                    hover:file:bg-primary-100 dark:hover:file:bg-primary-900/30
                    file:cursor-pointer cursor-pointer"
                />
              </div>
              
              {menteeFile && (
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <FileSpreadsheet className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-700 dark:text-green-300">{menteeFile.name}</span>
                  </div>
                  <Button
                    onClick={uploadMentees}
                    disabled={menteeUploading}
                    className="px-4 py-2"
                  >
                    {menteeUploading ? 'Uploading...' : 'Upload Mentees'}
                  </Button>
                </div>
              )}
              
              <ResultMessage result={menteeResult} />
            </div>
          </div>
        </div>

        {/* Pairing Statistics and Control Section */}
        <div className="mt-6 space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b">
            <Shuffle className="w-5 h-5 text-purple-600" />
            <h4 className="font-medium text-gray-900 dark:text-gray-100">Mentorship Pairing</h4>
          </div>

          {statistics && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">{statistics.totalMentors}</div>
                <div className="text-xs text-blue-700 dark:text-blue-300">Total Mentors</div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">{statistics.totalMentees}</div>
                <div className="text-xs text-green-700 dark:text-green-300">Total Mentees</div>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-600">{statistics.totalMatches}</div>
                <div className="text-xs text-purple-700 dark:text-purple-300">Total Matches</div>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-emerald-600">{statistics.activeMatches}</div>
                <div className="text-xs text-emerald-700 dark:text-emerald-300">Active</div>
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-amber-600">{statistics.pendingMatches}</div>
                <div className="text-xs text-amber-700 dark:text-amber-300">Pending</div>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-red-600">{statistics.unmatchedMentees}</div>
                <div className="text-xs text-red-700 dark:text-red-300">Unmatched</div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg">
            <div>
              <h5 className="font-medium text-gray-900 dark:text-gray-100">Automatic Pairing</h5>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Automatically assign mentees to mentors using round-robin algorithm
              </p>
            </div>
            <Button
              onClick={performAutomaticPairing}
              disabled={pairingInProgress || (statistics?.unmatchedMentees === 0)}
              className="flex items-center space-x-2"
            >
              <Shuffle className="w-4 h-4" />
              <span>{pairingInProgress ? 'Pairing...' : 'Start Pairing'}</span>
            </Button>
          </div>

          <ResultMessage result={pairingResult} />
        </div>

        <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div className="text-sm text-amber-700 dark:text-amber-300">
              <p className="font-medium">Important Notes:</p>
              <ul className="mt-2 space-y-1 list-disc list-inside">
                <li>Files should be Excel format (.xlsx or .xls)</li>
                <li>First row should contain column headers</li>
                <li>Users with existing email addresses will be skipped</li>
                <li>Default password "ChangeMe123!" will be set for new users</li>
                <li>All uploaded users will be marked as active</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};