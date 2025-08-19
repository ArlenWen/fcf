import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  ChevronDown, 
  ChevronRight, 
  RefreshCw,
  Menu,
  X
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ selectedFeature, onFeatureSelect, isOpen, onToggle }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState(['file-converter']);
  const navigate = useNavigate();

  const menuItems = [
    {
      id: 'file-converter',
      title: '文件转换',
      icon: RefreshCw,
      path: '/file-converter',
      subItems: [
        { id: 'pdf-convert', title: 'PDF转换', path: '/file-converter?tab=pdf', tabType: 'pdf' },
        { id: 'word-convert', title: 'Word转换', path: '/file-converter?tab=word', tabType: 'word' },
        { id: 'excel-convert', title: 'Excel转换', path: '/file-converter?tab=excel', tabType: 'excel' },
        { id: 'image-convert', title: '图片转换', path: '/file-converter?tab=image', tabType: 'image' },
        { id: 'html-convert', title: 'HTML转换', path: '/file-converter?tab=html', tabType: 'html' },
        { id: 'csv-convert', title: 'CSV转换', path: '/file-converter?tab=csv', tabType: 'csv' },
        { id: 'text-convert', title: '文本转换', path: '/file-converter?tab=text', tabType: 'text' }
      ]
    }
  ];

  const toggleExpanded = (itemId) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleItemClick = (item, subItem = null) => {
    const targetItem = subItem || item;
    onFeatureSelect(targetItem.id);
    navigate(targetItem.path);
  };

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="logo">
          <FileText size={24} />
          {!isCollapsed && <span>文件转换工具</span>}
        </div>
        <button 
          className="collapse-btn"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <Menu size={20} /> : <X size={20} />}
        </button>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map(item => {
          const Icon = item.icon;
          const isExpanded = expandedItems.includes(item.id);
          const isSelected = selectedFeature === item.id || 
            (item.subItems && item.subItems.some(sub => sub.id === selectedFeature));

          return (
            <div key={item.id} className="nav-item">
              <div 
                className={`nav-link ${isSelected ? 'active' : ''}`}
                onClick={() => {
                  if (item.subItems) {
                    toggleExpanded(item.id);
                  } else {
                    handleItemClick(item);
                  }
                }}
              >
                <div className="nav-link-content">
                  <Icon size={20} />
                  {!isCollapsed && <span>{item.title}</span>}
                </div>
                {!isCollapsed && item.subItems && (
                  <div className="expand-icon">
                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </div>
                )}
              </div>

              {!isCollapsed && item.subItems && isExpanded && (
                <div className="sub-items">
                  {item.subItems.map(subItem => (
                    <div
                      key={subItem.id}
                      className={`sub-item ${selectedFeature === subItem.id ? 'active' : ''}`}
                      onClick={() => handleItemClick(item, subItem)}
                    >
                      <span>{subItem.title}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
