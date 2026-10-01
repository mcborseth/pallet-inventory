import React, { useState, useEffect, useMemo, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  signInWithCustomToken, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot 
} from 'firebase/firestore';
import {
  Boxes,
  Package,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Trash2,
  Edit2,
  Mail,
  Copy,
  Download,
  Search,
  RefreshCw,
  Warehouse,
  ExternalLink,
  Check,
  Building,
  Layers,
  Settings,
  X,
  Users,
  Wifi,
  WifiOff,
  UserCheck,
  Send,
  Sliders,
  DollarSign
} from 'lucide-react';

// Global configurations provided by the environment
const rawFirebaseConfig = typeof __firebase_config !== 'undefined' 
  ? __firebase_config 
  : JSON.stringify({
      apiKey: "demo-api-key",
      authDomain: "demo-app.firebaseapp.com",
      projectId: "demo-pallet-app",
      storageBucket: "demo-pallet-app.appspot.com",
      messagingSenderId: "123456789",
      appId: "1:123456789:web:abcdef"
    });

const firebaseConfig = JSON.parse(rawFirebaseConfig);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'pallet-inventory-sys';

const INITIAL_PALLET_CATALOG = [
  {
    id: 'plt-gma-1',
    dimensions: '48" x 40"',
    name: 'GMA Standard #1 (Grade A)',
    material: 'Wood',
    quantity: 160,
    minThreshold: 80,
    targetStock: 250,
    unitCost: 14.50,
    location: 'Bay A-01',
    supplierName: 'Midwest Pallet Co.',
    supplierEmail: 'orders@midwestpallet.example.com',
    lastUpdatedBy: 'System Init'
  },
  {
    id: 'plt-gma-2',
    dimensions: '48" x 40"',
    name: 'GMA Standard #2 (Grade B / Utility)',
    material: 'Wood',
    quantity: 45,
    minThreshold: 75,
    targetStock: 200,
    unitCost: 9.75,
    location: 'Bay A-04',
    supplierName: 'Midwest Pallet Co.',
    supplierEmail: 'orders@midwestpallet.example.com',
    lastUpdatedBy: 'System Init'
  },
  {
    id: 'plt-block-hd',
    dimensions: '48" x 40"',
    name: '4-Way Block Pallet (Heavy Duty)',
    material: 'Wood (HT)',
    quantity: 28,
    minThreshold: 50,
    targetStock: 120,
    unitCost: 19.50,
    location: 'Bay B-02',
    supplierName: 'Industrial Timber Works',
    supplierEmail: 'supply@timberworks.example.com',
    lastUpdatedBy: 'System Init'
  },
  {
    id: 'plt-chem-42',
    dimensions: '42" x 42"',
    name: 'Chemical & Telecom Square Deck',
    material: 'Wood (HT)',
    quantity: 18,
    minThreshold: 40,
    targetStock: 90,
    unitCost: 16.80,
    location: 'Bay C-01',
    supplierName: 'Chem Logistics Supp.',
    supplierEmail: 'dispatch@chemlogistics.example.com',
    lastUpdatedBy: 'System Init'
  },
  {
    id: 'plt-drum-48',
    dimensions: '48" x 48"',
    name: 'Drum / Chemical 55gal 4-Way',
    material: 'Wood (HT)',
    quantity: 22,
    minThreshold: 35,
    targetStock: 80,
    unitCost: 18.25,
    location: 'Bay C-03',
    supplierName: 'Chem Logistics Supp.',
    supplierEmail: 'dispatch@chemlogistics.example.com',
    lastUpdatedBy: 'System Init'
  },
  {
    id: 'plt-epal-1',
    dimensions: '1200 x 800 mm',
    name: 'EUR 1 / EPAL Standard Euro',
    material: 'Wood (EPAL HT)',
    quantity: 34,
    minThreshold: 60,
    targetStock: 150,
    unitCost: 23.50,
    location: 'Bay D-01',
    supplierName: 'Euro Freight Supplies',
    supplierEmail: 'procure@eurosupplies.example.com',
    lastUpdatedBy: 'System Init'
  },
  {
    id: 'plt-epal-2',
    dimensions: '1200 x 1000 mm',
    name: 'EUR 2 Industrial Base',
    material: 'Wood (EPAL HT)',
    quantity: 52,
    minThreshold: 40,
    targetStock: 100,
    unitCost: 26.00,
    location: 'Bay D-03',
    supplierName: 'Euro Freight Supplies',
    supplierEmail: 'procure@eurosupplies.example.com',
    lastUpdatedBy: 'System Init'
  },
  {
    id: 'plt-plastic-hdpe',
    dimensions: '48" x 40"',
    name: 'Hygienic Solid Deck Cleanroom',
    material: 'Plastic (HDPE)',
    quantity: 14,
    minThreshold: 30,
    targetStock: 60,
    unitCost: 48.00,
    location: 'Cleanroom Airlock',
    supplierName: 'PureClean Polymer Co.',
    supplierEmail: 'sales@purecleanpoly.example.com',
    lastUpdatedBy: 'System Init'
  },
  {
    id: 'plt-bev-36',
    dimensions: '36" x 36"',
    name: 'Compact Beverage / Bottler Base',
    material: 'Wood',
    quantity: 68,
    minThreshold: 30,
    targetStock: 80,
    unitCost: 12.50,
    location: 'Bay E-01',
    supplierName: 'Midwest Pallet Co.',
    supplierEmail: 'orders@midwestpallet.example.com',
    lastUpdatedBy: 'System Init'
  },
  {
    id: 'plt-supersack',
    dimensions: '44" x 44"',
    name: 'Bulk Bag / Super Sack Pallet',
    material: 'Wood (HT)',
    quantity: 12,
    minThreshold: 35,
    targetStock: 75,
    unitCost: 17.90,
    location: 'Bay E-04',
    supplierName: 'Industrial Timber Works',
    supplierEmail: 'supply@timberworks.example.com',
    lastUpdatedBy: 'System Init'
  },
  {
    id: 'plt-auto-45',
    dimensions: '48" x 45"',
    name: 'Automotive Component Grid',
    material: 'Wood (HT)',
    quantity: 42,
    minThreshold: 45,
    targetStock: 110,
    unitCost: 21.00,
    location: 'Bay F-02',
    supplierName: 'Auto Logistics Wood',
    supplierEmail: 'orders@autowood.example.com',
    lastUpdatedBy: 'System Init'
  },
  {
    id: 'plt-half-24',
    dimensions: '40" x 24"',
    name: 'Retail Display Half-Pallet',
    material: 'Wood',
    quantity: 85,
    minThreshold: 40,
    targetStock: 120,
    unitCost: 9.20,
    location: 'Staging Dock 2',
    supplierName: 'Midwest Pallet Co.',
    supplierEmail: 'orders@midwestpallet.example.com',
    lastUpdatedBy: 'System Init'
  },
  {
    id: 'plt-paper-4836',
    dimensions: '48" x 36"',
    name: 'Paper & Printing Mill Heavy',
    material: 'Wood',
    quantity: 26,
    minThreshold: 25,
    targetStock: 50,
    unitCost: 15.50,
    location: 'Bay G-01',
    supplierName: 'Industrial Timber Works',
    supplierEmail: 'supply@timberworks.example.com',
    lastUpdatedBy: 'System Init'
  },
  {
    id: 'plt-plastic-rack',
    dimensions: '48" x 40"',
    name: 'Rackable Heavy Duty Vented',
    material: 'Plastic (Recycled)',
    quantity: 38,
    minThreshold: 20,
    targetStock: 60,
    unitCost: 39.50,
    location: 'High-Bay Rack 12',
    supplierName: 'PureClean Polymer Co.',
    supplierEmail: 'sales@purecleanpoly.example.com',
    lastUpdatedBy: 'System Init'
  },
  {
    id: 'plt-export-corrugated',
    dimensions: '48" x 40"',
    name: 'Air Cargo Lightweight Export',
    material: 'Corrugated / Paper',
    quantity: 19,
    minThreshold: 25,
    targetStock: 50,
    unitCost: 8.50,
    location: 'Airfreight Stage',
    supplierName: 'EcoPack Corrugated',
    supplierEmail: 'freight@ecopack.example.com',
    lastUpdatedBy: 'System Init'
  }
];

export default function App() {
  const [user, setUser] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [pallets, setPallets] = useState([]);
  const [isSyncing, setIsSyncing] = useState(true);
  const [syncError, setSyncError] = useState(null);
  const [activeUsersCount, setActiveUsersCount] = useState(1);

  // Worker Station / Persona Selector
  const [workerName, setWorkerName] = useState(() => {
    return localStorage.getItem('pallet_worker_name') || 'Forklift Driver 1';
  });
  const [workerRole, setWorkerRole] = useState(() => {
    return localStorage.getItem('pallet_worker_role') || 'Receiving / Floor';
  });

  // Facility Settings
  const [facilityInfo, setFacilityInfo] = useState({
    facilityName: 'Central Logistics Hub #4',
    contactPerson: 'Operations Desk',
    contactPhone: '(555) 382-9901',
    deliveryAddress: '4800 Logistics Pkwy, Dock Doors 12-16, Columbus, OH 43228',
    poNumberPrefix: 'PO-PLT-'
  });

  // UI States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState('all'); // all, low, stocked
  const [materialFilter, setMaterialFilter] = useState('all');
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingPallet, setEditingPallet] = useState(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedForOrder, setSelectedForOrder] = useState([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    dimensions: '',
    name: '',
    material: 'Wood',
    quantity: 50,
    minThreshold: 30,
    targetStock: 100,
    unitCost: 15.00,
    location: '',
    supplierName: '',
    supplierEmail: ''
  });

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.warn('Firebase Auth fallback warning:', err);
        // Retry with anonymous sign-in if custom token expired
        try {
          await signInAnonymously(auth);
        } catch (innerErr) {
          console.error('Anonymous auth failed:', innerErr);
        }
      }
    };

    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    // Follow Rule 1: Public artifacts collection
    const palletsCollectionRef = collection(db, 'artifacts', appId, 'public', 'data', 'pallets');

    setIsSyncing(true);
    const unsubscribe = onSnapshot(
      palletsCollectionRef,
      (snapshot) => {
        setIsSyncing(false);
        setSyncError(null);

        if (snapshot.empty) {
          // Auto-seed default catalog on very first cloud run
          seedDefaultCatalog();
        } else {
          const loaded = [];
          snapshot.forEach((docSnap) => {
            loaded.push({ id: docSnap.id, ...docSnap.data() });
          });
          setPallets(loaded);
        }
      },
      (error) => {
        console.error('Firestore Real-time Sync Error:', error);
        setSyncError(error.message);
        setIsSyncing(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Save worker profile changes
  const updateWorkerProfile = (newName, newRole) => {
    setWorkerName(newName);
    setWorkerRole(newRole);
    try {
      localStorage.setItem('pallet_worker_name', newName);
      localStorage.setItem('pallet_worker_role', newRole);
    } catch (e) {
      console.error(e);
    }
  };

  const seedDefaultCatalog = async () => {
    if (!user || isSeeding) return;
    setIsSeeding(true);
    try {
      for (const item of INITIAL_PALLET_CATALOG) {
        const itemDoc = doc(db, 'artifacts', appId, 'public', 'data', 'pallets', item.id);
        await setDoc(itemDoc, {
          ...item,
          updatedAt: new Date().toISOString(),
          lastUpdatedBy: `${workerName} (${workerRole})`
        });
      }
    } catch (err) {
      console.error('Error seeding defaults:', err);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleQuantityAdjust = async (pallet, delta) => {
    if (!user) return;
    const newQty = Math.max(0, (Number(pallet.quantity) || 0) + delta);
    const palletRef = doc(db, 'artifacts', appId, 'public', 'data', 'pallets', pallet.id);

    try {
      await updateDoc(palletRef, {
        quantity: newQty,
        updatedAt: new Date().toISOString(),
        lastUpdatedBy: `${workerName} (${workerRole})`
      });
    } catch (err) {
      console.error('Failed to update quantity:', err);
    }
  };

  const handleManualQuantitySet = async (pallet, value) => {
    if (!user) return;
    const val = Math.max(0, parseInt(value, 10) || 0);
    const palletRef = doc(db, 'artifacts', appId, 'public', 'data', 'pallets', pallet.id);

    try {
      await updateDoc(palletRef, {
        quantity: val,
        updatedAt: new Date().toISOString(),
        lastUpdatedBy: `${workerName} (${workerRole})`
      });
    } catch (err) {
      console.error('Failed to set quantity:', err);
    }
  };

  const handleSavePallet = async (e) => {
    e.preventDefault();
    if (!user || !formData.dimensions.trim() || !formData.name.trim()) return;

    const palletId = editingPallet ? editingPallet.id : 'plt-' + Date.now();
    const palletRef = doc(db, 'artifacts', appId, 'public', 'data', 'pallets', palletId);

    const payload = {
      dimensions: formData.dimensions.trim(),
      name: formData.name.trim(),
      material: formData.material,
      quantity: Number(formData.quantity) || 0,
      minThreshold: Number(formData.minThreshold) || 0,
      targetStock: Number(formData.targetStock) || 0,
      unitCost: Number(formData.unitCost) || 0,
      location: formData.location.trim() || 'Unassigned',
      supplierName: formData.supplierName.trim() || 'General Supplier',
      supplierEmail: formData.supplierEmail.trim() || '',
      updatedAt: new Date().toISOString(),
      lastUpdatedBy: `${workerName} (${workerRole})`
    };

    try {
      await setDoc(palletRef, payload, { merge: true });
      setIsAddEditOpen(false);
      setEditingPallet(null);
    } catch (err) {
      console.error('Error saving pallet record:', err);
    }
  };

  const handleDeletePallet = async (id, name) => {
    if (!user) return;
    const ok = window.confirm(`Permanently remove "${name}" from the live shared catalog?`);
    if (!ok) return;

    try {
      const palletRef = doc(db, 'artifacts', appId, 'public', 'data', 'pallets', id);
      await deleteDoc(palletRef);
    } catch (err) {
      console.error('Error deleting pallet:', err);
    }
  };

  const stats = useMemo(() => {
    const totalTypes = pallets.length;
    const totalUnits = pallets.reduce((sum, p) => sum + (Number(p.quantity) || 0), 0);
    const lowStockItems = pallets.filter(p => Number(p.quantity) <= Number(p.minThreshold));
    const totalAssetVal = pallets.reduce((sum, p) => sum + ((Number(p.quantity) || 0) * (Number(p.unitCost) || 0)), 0);

    return {
      totalTypes,
      totalUnits,
      lowStockCount: lowStockItems.length,
      lowStockItems,
      totalAssetVal
    };
  }, [pallets]);

  const filteredPallets = useMemo(() => {
    return pallets
      .filter((p) => {
        const query = searchQuery.toLowerCase();
        const matchesQuery =
          p.dimensions?.toLowerCase().includes(query) ||
          p.name?.toLowerCase().includes(query) ||
          p.material?.toLowerCase().includes(query) ||
          p.location?.toLowerCase().includes(query) ||
          p.supplierName?.toLowerCase().includes(query);

        const isLow = Number(p.quantity) <= Number(p.minThreshold);
        const matchesStatus =
          filterMode === 'all' ? true :
          filterMode === 'low' ? isLow :
          !isLow;

        const matchesMaterial =
          materialFilter === 'all'
            ? true
            : p.material?.toLowerCase().includes(materialFilter.toLowerCase());

        return matchesQuery && matchesStatus && matchesMaterial;
      })
      .sort((a, b) => {
        // Show low stock items first
        const aLow = Number(a.quantity) <= Number(a.minThreshold) ? 1 : 0;
        const bLow = Number(b.quantity) <= Number(b.minThreshold) ? 1 : 0;
        if (bLow !== aLow) return bLow - aLow;
        return a.dimensions.localeCompare(b.dimensions);
      });
  }, [pallets, searchQuery, filterMode, materialFilter]);

  const generateOrderDraft = () => {
    const today = new Date().toLocaleDateString();
    const poNum = `${facilityInfo.poNumberPrefix}${Math.floor(100000 + Math.random() * 900000)}`;

    let plain = `PALLET REPLENISHMENT PURCHASE ORDER: ${poNum}\n`;
    plain += `====================================================\n`;
    plain += `Date: ${today}\n`;
    plain += `Facility: ${facilityInfo.facilityName}\n`;
    plain += `Delivery Dock: ${facilityInfo.deliveryAddress}\n`;
    plain += `Contact: ${facilityInfo.contactPerson} (${facilityInfo.contactPhone})\n`;
    plain += `Issued By: ${workerName} [${workerRole}]\n`;
    plain += `====================================================\n\n`;
    plain += `REQUIRED PALLETS:\n`;

    let totalEst = 0;
    selectedForOrder.forEach((item, idx) => {
      const orderQty = Math.max(1, (Number(item.targetStock) || 100) - Number(item.quantity));
      const lineCost = orderQty * (Number(item.unitCost) || 0);
      totalEst += lineCost;

      plain += `${idx + 1}. [${item.dimensions}] ${item.name} (${item.material})\n`;
      plain += `   - Current On-Hand: ${item.quantity} | Min Safety Threshold: ${item.minThreshold}\n`;
      plain += `   - Requested Order Quantity: ${orderQty} units\n`;
      if (item.unitCost > 0) {
        plain += `   - Estimated Unit Cost: $${Number(item.unitCost).toFixed(2)} | Subtotal: $${lineCost.toFixed(2)}\n`;
      }
      plain += `   - Staging Bay: ${item.location} | Supplier: ${item.supplierName} (${item.supplierEmail || 'No Email'})\n\n`;
    });

    plain += `----------------------------------------------------\n`;
    plain += `Total Estimated Order Value: $${totalEst.toFixed(2)}\n\n`;
    plain += `Note: Please confirm dock delivery schedule, freight lead time, and pricing confirmation.\n`;
    plain += `Thank you,\n${facilityInfo.facilityName} Receiving Team`;

    return { text: plain, poNum, totalEst };
  };

  const handleLaunchEmailClient = () => {
    const { text, poNum } = generateOrderDraft();
    const recipients = Array.from(
      new Set(selectedForOrder.map((i) => i.supplierEmail).filter(Boolean))
    );
    const toField = recipients.join(',');
    const subject = encodeURIComponent(
      `Pallet Replenishment Order [${poNum}] - ${facilityInfo.facilityName}`
    );
    const body = encodeURIComponent(text);
    window.location.href = `mailto:${toField}?subject=${subject}&body=${body}`;
  };

  const handleCopyOrder = () => {
    const { text } = generateOrderDraft();
    navigator.clipboard.writeText(text);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2200);
  };

  const exportToCSV = () => {
    const headers = [
      'Dimensions',
      'Name',
      'Material',
      'Quantity In Stock',
      'Min Threshold',
      'Target Stock',
      'Unit Cost',
      'Location',
      'Supplier Name',
      'Supplier Email',
      'Last Updated By',
      'Updated At'
    ];
    const rows = pallets.map((p) => [
      `"${p.dimensions || ''}"`,
      `"${p.name || ''}"`,
      `"${p.material || ''}"`,
      p.quantity || 0,
      p.minThreshold || 0,
      p.targetStock || 0,
      p.unitCost || 0,
      `"${p.location || ''}"`,
      `"${p.supplierName || ''}"`,
      `"${p.supplierEmail || ''}"`,
      `"${p.lastUpdatedBy || ''}"`,
      `"${p.updatedAt || ''}"`
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `pallet_inventory_audit_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openAddModal = () => {
    setEditingPallet(null);
    setFormData({
      dimensions: '',
      name: '',
      material: 'Wood',
      quantity: 50,
      minThreshold: 30,
      targetStock: 100,
      unitCost: 15.0,
      location: 'Bay 1',
      supplierName: '',
      supplierEmail: ''
    });
    setIsAddEditOpen(true);
  };

  const openEditModal = (item) => {
    setEditingPallet(item);
    setFormData({ ...item });
    setIsAddEditOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-amber-500 selection:text-slate-950">
      
      {/* Real-Time Sync & Station Status Header */}
      <header className="bg-slate-900/95 border-b border-slate-800 sticky top-0 z-30 backdrop-blur">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between gap-2">
            
            {/* Logo & Facility */}
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-tr from-amber-500 to-amber-400 rounded-xl text-slate-950 shadow-md shadow-amber-500/20">
                <Boxes className="w-6 h-6 stroke-[2.3]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-base sm:text-lg tracking-tight text-white">
                    PalletSync Pro
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Wifi className="w-3 h-3 text-emerald-400 animate-pulse" />
                    Multi-User Live
                  </span>
                </div>
                <p className="text-xs text-slate-400 hidden md:block">
                  {facilityInfo.facilityName} &bull; Shared Inventory Database
                </p>
              </div>
            </div>

            {/* Station / Worker Selector & Quick Actions */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              
              {/* Station Badge & Switcher */}
              <div className="flex items-center bg-slate-800/80 border border-slate-700 rounded-lg p-1 text-xs">
                <UserCheck className="w-3.5 h-3.5 text-amber-400 ml-1.5 mr-1" />
                <input
                  type="text"
                  value={workerName}
                  onChange={(e) => updateWorkerProfile(e.target.value, workerRole)}
                  className="bg-transparent text-slate-200 font-semibold w-24 sm:w-28 focus:outline-none focus:text-white px-1 text-xs"
                  placeholder="Your Name"
                  title="Click to rename your current station or operator name"
                />
                <select
                  value={workerRole}
                  onChange={(e) => updateWorkerProfile(workerName, e.target.value)}
                  className="bg-slate-900 text-slate-300 rounded px-1.5 py-0.5 text-[11px] font-medium border border-slate-700 focus:outline-none"
                >
                  <option value="Receiving / Floor">Floor</option>
                  <option value="Purchasing / Office">Office</option>
                  <option value="Forklift Lead">Forklift</option>
                  <option value="Warehouse Lead">Supervisor</option>
                </select>
              </div>

              {/* Facility Settings */}
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition"
                title="Warehouse & PO Settings"
              >
                <Settings className="w-4 h-4" />
              </button>

              {/* Export CSV */}
              <button
                onClick={exportToCSV}
                className="p-2 sm:px-3 sm:py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition flex items-center gap-1.5"
                title="Export live inventory CSV audit"
              >
                <Download className="w-4 h-4 text-slate-400" />
                <span className="hidden sm:inline">Export</span>
              </button>

              {/* Add New Pallet Profile */}
              <button
                onClick={openAddModal}
                className="px-3.5 py-2 text-xs sm:text-sm font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-md shadow-amber-400/20 transition flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span className="hidden xs:inline">Add Pallet Size</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 space-y-5">
        
        {/* Connection status banner if error */}
        {syncError && (
          <div className="bg-rose-950/40 border border-rose-600/50 rounded-lg p-3 text-xs text-rose-300 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <WifiOff className="w-4 h-4 text-rose-400" />
              Sync warning: {syncError}
            </span>
            <button
              onClick={() => window.location.reload()}
              className="underline hover:text-white"
            >
              Reload
            </button>
          </div>
        )}

        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          
          {/* Managed Profiles */}
          <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-800 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Pallet Profiles
              </span>
              <Layers className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white">
              {stats.totalTypes}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Live tracked sizes & specs
            </div>
          </div>

          {/* Total Units in Warehouse */}
          <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-800 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Total Units On-Hand
              </span>
              <Package className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
              {stats.totalUnits.toLocaleString()}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Pallets counted across all bays
            </div>
          </div>

          {/* Action Trigger Card: Low Stock */}
          <div className={`rounded-xl p-4 border shadow-sm transition relative overflow-hidden ${
            stats.lowStockCount > 0 
              ? 'bg-rose-950/20 border-rose-500/40 text-rose-200' 
              : 'bg-slate-900/90 border-slate-800 text-slate-400'
          }`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Needs Reorder
              </span>
              <AlertTriangle className={`w-4 h-4 ${stats.lowStockCount > 0 ? 'text-rose-400 animate-pulse' : 'text-slate-500'}`} />
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl sm:text-3xl font-extrabold ${stats.lowStockCount > 0 ? 'text-rose-400' : 'text-slate-300'}`}>
                {stats.lowStockCount}
              </span>
              <span className="text-xs text-slate-400">at or below safety par</span>
            </div>

            {stats.lowStockCount > 0 ? (
              <button
                onClick={() => {
                  setSelectedForOrder(stats.lowStockItems);
                  setIsOrderModalOpen(true);
                }}
                className="mt-2 text-xs font-bold text-rose-300 hover:text-white underline flex items-center gap-1"
              >
                Dispatch Purchase Request ({stats.lowStockCount}) &rarr;
              </button>
            ) : (
              <div className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> All safety buffers healthy
              </div>
            )}
          </div>

          {/* Catalog Value */}
          <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-800 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Asset Valuation
              </span>
              <DollarSign className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white">
              ${stats.totalAssetVal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Based on active supplier unit costs
            </div>
          </div>
        </section>

        <section className="bg-slate-900/90 rounded-xl p-3.5 sm:p-4 border border-slate-800 space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            
            {/* Search */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search dimensions (48x40), spec name, material, bay location, supplier..."
                className="w-full pl-9 pr-8 py-2 bg-slate-950 border border-slate-700/80 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-medium">
                <button
                  onClick={() => setFilterMode('all')}
                  className={`px-3 py-1.5 rounded-md transition ${filterMode === 'all' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  All ({pallets.length})
                </button>
                <button
                  onClick={() => setFilterMode('low')}
                  className={`px-3 py-1.5 rounded-md transition flex items-center gap-1.5 ${filterMode === 'low' ? 'bg-rose-600 text-white font-bold' : 'text-rose-400 hover:text-rose-300'}`}
                >
                  Low Stock ({stats.lowStockCount})
                </button>
                <button
                  onClick={() => setFilterMode('stocked')}
                  className={`px-3 py-1.5 rounded-md transition ${filterMode === 'stocked' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  Healthy ({pallets.length - stats.lowStockCount})
                </button>
              </div>

              {/* Material Dropdown */}
              <select
                value={materialFilter}
                onChange={(e) => setMaterialFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">All Materials</option>
                <option value="wood">Wood Only</option>
                <option value="plastic">Plastic Only</option>
                <option value="ht">Heat-Treated (ISPM-15)</option>
                <option value="corrugated">Corrugated / Paper</option>
              </select>

              {/* Cloud Re-seed Tool */}
              <button
                onClick={() => {
                  if (confirm('Re-sync / seed standard pallet sizes to the live database?')) {
                    seedDefaultCatalog();
                  }
                }}
                disabled={isSeeding}
                className="px-2.5 py-2 text-slate-400 hover:text-slate-200 bg-slate-950 border border-slate-800 rounded-lg text-xs flex items-center gap-1 disabled:opacity-50"
                title="Populate/Reset default 15 pallet catalog in Firestore"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSeeding ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Re-Seed</span>
              </button>
            </div>
          </div>
        </section>

        <section className="bg-slate-900/90 rounded-xl border border-slate-800 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Size & Pallet Name</th>
                  <th className="py-3 px-4">Material / Bay</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center min-w-[200px]">Live Count Adjust</th>
                  <th className="py-3 px-4 text-center">Safety Buffer</th>
                  <th className="py-3 px-4">Supplier & Auditor</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {isSyncing && pallets.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-16 text-slate-400">
                      <RefreshCw className="w-8 h-8 mx-auto mb-2 text-amber-400 animate-spin" />
                      <p className="text-sm font-semibold">Connecting to live warehouse inventory database...</p>
                    </td>
                  </tr>
                ) : filteredPallets.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-16 text-slate-400">
                      <Boxes className="w-10 h-10 mx-auto mb-2 text-slate-600" />
                      <p className="text-base font-semibold text-slate-300">No matching pallet profiles found</p>
                      <p className="text-xs text-slate-500 mt-1">Adjust filters or click 'Add Pallet Size' to register new stock.</p>
                    </td>
                  </tr>
                ) : (
                  filteredPallets.map((pallet) => {
                    const isLow = Number(pallet.quantity) <= Number(pallet.minThreshold);
                    const stockRatio = Math.min(
                      100,
                      Math.round(
                        (pallet.quantity / (pallet.targetStock || pallet.minThreshold * 2 || 1)) * 100
                      )
                    );

                    return (
                      <tr
                        key={pallet.id}
                        className={`transition hover:bg-slate-800/40 ${
                          isLow ? 'bg-rose-950/10' : ''
                        }`}
                      >
                        {/* Size & Spec */}
                        <td className="py-3 px-4">
                          <div className="font-bold text-white text-base font-mono flex items-center gap-2">
                            {pallet.dimensions}
                            {isLow && (
                              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                            )}
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5 font-medium">
                            {pallet.name}
                          </div>
                          {pallet.unitCost > 0 && (
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              Est. ${Number(pallet.unitCost).toFixed(2)}/unit
                            </div>
                          )}
                        </td>

                        {/* Material & Bay */}
                        <td className="py-3 px-4 text-xs">
                          <div className="text-slate-200 font-semibold">{pallet.material}</div>
                          <div className="text-slate-400 mt-0.5 flex items-center gap-1">
                            <Warehouse className="w-3 h-3 text-slate-500" />
                            <span>{pallet.location || 'Unassigned'}</span>
                          </div>
                        </td>

                        {/* Status Badge */}
                        <td className="py-3 px-4 text-center">
                          {isLow ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                              Low &bull; Reorder
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                              Stock OK
                            </span>
                          )}
                        </td>

                        {/* Quantity Adjuster with Direct Sync */}
                        <td className="py-3 px-4 text-center">
                          <div className="inline-flex items-center space-x-1.5 bg-slate-950 border border-slate-800 rounded-lg p-1 shadow-inner">
                            <button
                              onClick={() => handleQuantityAdjust(pallet, -5)}
                              className="w-7 h-7 flex items-center justify-center text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"
                              title="Minus 5"
                            >
                              -5
                            </button>
                            <button
                              onClick={() => handleQuantityAdjust(pallet, -1)}
                              className="w-7 h-7 flex items-center justify-center text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"
                              title="Minus 1"
                            >
                              -1
                            </button>

                            <input
                              type="number"
                              min="0"
                              value={pallet.quantity}
                              onChange={(e) => handleManualQuantitySet(pallet, e.target.value)}
                              className={`w-14 text-center bg-transparent text-sm font-extrabold focus:outline-none ${
                                isLow ? 'text-rose-400' : 'text-white'
                              }`}
                            />

                            <button
                              onClick={() => handleQuantityAdjust(pallet, 1)}
                              className="w-7 h-7 flex items-center justify-center text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"
                              title="Plus 1"
                            >
                              +1
                            </button>
                            <button
                              onClick={() => handleQuantityAdjust(pallet, 5)}
                              className="w-7 h-7 flex items-center justify-center text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"
                              title="Plus 5"
                            >
                              +5
                            </button>
                          </div>
                        </td>

                        {/* Safety Buffer & Par Meter */}
                        <td className="py-3 px-4 text-center">
                          <div className="text-xs font-medium text-slate-300">
                            Min: <span className="font-bold text-amber-400">{pallet.minThreshold}</span> | Par: {pallet.targetStock || pallet.minThreshold * 2}
                          </div>
                          <div className="w-24 mx-auto bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1.5">
                            <div
                              className={`h-full transition-all duration-300 ${
                                isLow ? 'bg-rose-500' : 'bg-emerald-400'
                              }`}
                              style={{ width: `${stockRatio}%` }}
                            />
                          </div>
                        </td>

                        {/* Supplier & Audit trail */}
                        <td className="py-3 px-4 text-xs">
                          <div className="font-semibold text-slate-200 truncate max-w-[150px]">
                            {pallet.supplierName || 'General Supplier'}
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <span className="text-slate-500">By:</span>
                            <span className="truncate max-w-[120px] text-amber-300/80">
                              {pallet.lastUpdatedBy || 'Initial'}
                            </span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            {isLow && (
                              <button
                                onClick={() => {
                                  setSelectedForOrder([pallet]);
                                  setIsOrderModalOpen(true);
                                }}
                                className="px-2.5 py-1 text-xs font-bold bg-rose-600/30 hover:bg-rose-600 text-rose-200 hover:text-white border border-rose-500/50 rounded-md transition flex items-center gap-1"
                                title="Draft replenishment order"
                              >
                                <Mail className="w-3.5 h-3.5" />
                                <span>Order</span>
                              </button>
                            )}

                            <button
                              onClick={() => openEditModal(pallet)}
                              className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-md transition"
                              title="Edit specifications"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleDeletePallet(pallet.id, pallet.name)}
                              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-md transition"
                              title="Remove pallet size from shared inventory"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {isAddEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Boxes className="w-5 h-5 text-amber-400" />
                {editingPallet ? 'Edit Pallet Size & Reorder Par' : 'Add New Pallet Size Profile'}
              </h3>
              <button
                onClick={() => setIsAddEditOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePallet} className="space-y-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Dimensions (e.g. 48" x 40") *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.dimensions}
                    onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                    placeholder='48" x 40" or 1200 x 800 mm'
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Pallet Name / Specification *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="GMA Standard #1"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Material Type
                  </label>
                  <select
                    value={formData.material}
                    onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="Wood">Wood (Standard)</option>
                    <option value="Wood (HT)">Wood Heat-Treated (ISPM-15)</option>
                    <option value="Plastic (HDPE)">Plastic (HDPE / Cleanroom)</option>
                    <option value="Plastic (Recycled)">Plastic (Recycled)</option>
                    <option value="Corrugated / Paper">Corrugated / Paper</option>
                    <option value="Metal / Aluminum">Metal / Aluminum</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Warehouse Bay Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Bay A-01, Staging 2"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Counts & Thresholds */}
              <div className="grid grid-cols-3 gap-3 bg-slate-950 p-3 rounded-lg border border-slate-800">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Current Units
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-amber-400 mb-1">
                    Min Threshold *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minThreshold}
                    onChange={(e) => setFormData({ ...formData, minThreshold: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-amber-400 font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-emerald-400 mb-1">
                    Par Reorder Level
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.targetStock}
                    onChange={(e) => setFormData({ ...formData, targetStock: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-emerald-400 font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Pricing & Supplier */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Unit Cost ($)
                  </label>
                  <input
                    type="number"
                    step="0.10"
                    min="0"
                    value={formData.unitCost}
                    onChange={(e) => setFormData({ ...formData, unitCost: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Supplier Name
                  </label>
                  <input
                    type="text"
                    value={formData.supplierName}
                    onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                    placeholder="Midwest Pallet Co."
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Supplier Email
                  </label>
                  <input
                    type="email"
                    value={formData.supplierEmail}
                    onChange={(e) => setFormData({ ...formData, supplierEmail: e.target.value })}
                    placeholder="orders@supplier.com"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddEditOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-md transition"
                >
                  {editingPallet ? 'Update in Firestore' : 'Save & Publish Live'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isOrderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Mail className="w-5 h-5 text-amber-400" />
                  Replenishment Purchase Order Dispatch
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Ordering for {selectedForOrder.length} pallet profile{selectedForOrder.length > 1 ? 's' : ''}
                </p>
              </div>
              <button
                onClick={() => setIsOrderModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Generated Order View */}
            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 overflow-y-auto flex-1 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed select-all">
              {generateOrderDraft().text}
            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800">
              <div className="text-xs text-slate-400">
                To:{' '}
                <span className="text-slate-200 font-semibold">
                  {Array.from(new Set(selectedForOrder.map((i) => i.supplierEmail).filter(Boolean))).join(', ') || 'No Supplier Emails on File'}
                </span>
              </div>

              <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                <button
                  onClick={handleCopyOrder}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition flex items-center gap-1.5"
                >
                  {copiedToast ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedToast ? 'Copied to Clipboard!' : 'Copy for Teams / Slack'}</span>
                </button>

                <button
                  onClick={handleLaunchEmailClient}
                  className="px-4 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-md transition flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Email (mailto:)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Building className="w-5 h-5 text-amber-400" />
                Facility & PO Dispatch Settings
              </h3>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Warehouse Hub Name
                </label>
                <input
                  type="text"
                  value={facilityInfo.facilityName}
                  onChange={(e) => setFacilityInfo({ ...facilityInfo, facilityName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Contact / Desk
                  </label>
                  <input
                    type="text"
                    value={facilityInfo.contactPerson}
                    onChange={(e) => setFacilityInfo({ ...facilityInfo, contactPerson: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Dispatch Phone
                  </label>
                  <input
                    type="text"
                    value={facilityInfo.contactPhone}
                    onChange={(e) => setFacilityInfo({ ...facilityInfo, contactPhone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Delivery Dock / Address
                </label>
                <input
                  type="text"
                  value={facilityInfo.deliveryAddress}
                  onChange={(e) => setFacilityInfo({ ...facilityInfo, deliveryAddress: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Purchase Order Prefix
                </label>
                <input
                  type="text"
                  value={facilityInfo.poNumberPrefix}
                  onChange={(e) => setFacilityInfo({ ...facilityInfo, poNumberPrefix: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950 py-3.5 px-6 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto w-full">
        <span>PalletSync Real-Time Inventory Control &bull; Multi-Station Connected</span>
        <span className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          Active User: {workerName} ({workerRole})
        </span>
      </footer>
    </div>
  );
}
