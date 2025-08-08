import { useSocket } from '../hooks/useSocket'
import { Building2, Users, Package, Target } from 'lucide-react'

export default function CompanyPage() {
  const { player } = useSocket()

  if (!player) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Company Management</h2>
        <p className="text-gray-600">Please start a game to manage your company.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Building2 className="h-8 w-8 text-primary-600" />
        <h1 className="text-3xl font-bold text-gray-900">Company Management</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-600">Company Name</label>
              <p className="text-lg font-semibold text-gray-900">{player.company.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Industry</label>
              <p className="text-lg text-gray-900">{player.company.industry}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Founded</label>
              <p className="text-lg text-gray-900">{new Date(player.company.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="btn-primary w-full flex items-center justify-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Hire Employee</span>
            </button>
            <button className="btn-secondary w-full flex items-center justify-center space-x-2">
              <Building2 className="h-4 w-4" />
              <span>Build Facility</span>
            </button>
            <button className="btn-success w-full flex items-center justify-center space-x-2">
              <Package className="h-4 w-4" />
              <span>Launch Product</span>
            </button>
            <button className="btn-warning w-full flex items-center justify-center space-x-2">
              <Target className="h-4 w-4" />
              <span>Start Campaign</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Employees</h3>
          <div className="space-y-2">
            {player.company.employees.length > 0 ? (
              player.company.employees.map((employee: any) => (
                <div key={employee.id} className="p-3 bg-gray-50 rounded">
                  <p className="font-medium">{employee.name}</p>
                  <p className="text-sm text-gray-600">{employee.position}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No employees yet</p>
            )}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Facilities</h3>
          <div className="space-y-2">
            {player.company.facilities.length > 0 ? (
              player.company.facilities.map((facility: any) => (
                <div key={facility.id} className="p-3 bg-gray-50 rounded">
                  <p className="font-medium">{facility.name}</p>
                  <p className="text-sm text-gray-600">{facility.type}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No facilities yet</p>
            )}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Products</h3>
          <div className="space-y-2">
            {player.company.products.length > 0 ? (
              player.company.products.map((product: any) => (
                <div key={product.id} className="p-3 bg-gray-50 rounded">
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-gray-600">${product.price}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No products yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 

