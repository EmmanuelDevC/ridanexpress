const PasswordRequirements = () => (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Password must contain:</h4>
        <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
            <li>At least 8 characters</li>
            <li>At least one uppercase letter</li>
            <li>At least one number</li>
            <li>At least one special character (@$!%*?&)</li>
        </ul>
    </div>
);

export default PasswordRequirements;