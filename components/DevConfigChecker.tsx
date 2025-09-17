"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ConfigStatus {
  firebase: boolean;
  backend: boolean;
  errors: string[];
}

export function DevConfigChecker() {
  const [configStatus, setConfigStatus] = useState<ConfigStatus>({
    firebase: false,
    backend: false,
    errors: []
  });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show in development
    if (process.env.NODE_ENV !== 'development') return;

    const checkConfig = async () => {
      const errors: string[] = [];
      let firebaseOk = false;
      let backendOk = false;

      // Check Firebase configuration
      const firebaseConfig = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      };

      const missingFirebaseKeys = Object.entries(firebaseConfig)
        .filter(([key, value]) => !value || value.includes('your_'))
        .map(([key]) => key);

      if (missingFirebaseKeys.length === 0) {
        firebaseOk = true;
      } else {
        errors.push(`Missing Firebase config: ${missingFirebaseKeys.join(', ')}`);
      }

      // Check backend connection
      try {
        const response = await fetch('http://localhost:5000/api/auth/me', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.status === 401) {
          // 401 is expected without auth token, means server is running
          backendOk = true;
        }
      } catch (error) {
        errors.push('Backend server not running on http://localhost:5000');
      }

      setConfigStatus({ firebase: firebaseOk, backend: backendOk, errors });
      setIsVisible(errors.length > 0 || !firebaseOk || !backendOk);
    };

    checkConfig();
  }, []);

  if (!isVisible || process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 w-80">
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-orange-800">
              Development Setup Status
            </CardTitle>
            <button
              onClick={() => setIsVisible(false)}
              className="text-orange-600 hover:text-orange-800"
            >
              ×
            </button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-orange-700">Firebase Config:</span>
            <Badge variant={configStatus.firebase ? "default" : "destructive"}>
              {configStatus.firebase ? "OK" : "Missing"}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-orange-700">Backend Server:</span>
            <Badge variant={configStatus.backend ? "default" : "destructive"}>
              {configStatus.backend ? "Running" : "Offline"}
            </Badge>
          </div>

          {configStatus.errors.length > 0 && (
            <div className="mt-3 space-y-1">
              <p className="text-xs font-medium text-orange-800">Issues:</p>
              {configStatus.errors.map((error, index) => (
                <p key={index} className="text-xs text-orange-700">
                  • {error}
                </p>
              ))}
              <p className="text-xs text-orange-600 mt-2">
                See SETUP_INSTRUCTIONS.md for help
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}